import type { Block } from "@/types/blocks";
import { useCallback, useState, useRef, useEffect } from "react";
import { debounce } from "lodash";

// Define the email styles interface
export interface EmailStyles {
  bgColor: string;
  isInset: boolean;
  emailBgColor: string;
  defaultTextColor: string;
  defaultFont: string;
  isRounded: boolean;
  linkColor: string;
}

interface BlockStateHistory {
  past: {
    blocks: Block[];
    styles: EmailStyles;
  }[];
  present: {
    blocks: Block[];
    styles: EmailStyles;
  };
  future: {
    blocks: Block[];
    styles: EmailStyles;
  }[];
}

export function useBlockStateManager(
  initialBlocks: Block[] = [],
  initialStyles: EmailStyles = {
    bgColor: "#ffffff",
    isInset: false,
    emailBgColor: "#eeeeee",
    defaultTextColor: "#000000",
    defaultFont: "sans-serif",
    isRounded: true,
    linkColor: "#0000ff",
  },
) {
  // Separate state for current values (UI) and history
  const [currentState, setCurrentState] = useState({
    blocks: initialBlocks,
    styles: initialStyles,
  });

  const [history, setHistory] = useState<BlockStateHistory>({
    past: [],
    present: {
      blocks: initialBlocks,
      styles: initialStyles,
    },
    future: [],
  });

  // Track if we're in the middle of a debounced update
  const isDebouncing = useRef(false);
  const lastHistoryUpdate = useRef<typeof currentState>(currentState);
  const pendingHistoryUpdate = useRef<typeof currentState | null>(null);
  const pendingCommitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update blocks immediately for UI without affecting history
  const updateBlocksWithoutHistory = useCallback((newBlocks: Block[]) => {
    // Ensure blocks are sorted by order
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    setCurrentState((current) => ({
      ...current,
      blocks: sortedBlocks,
    }));
  }, []);

  // Update styles immediately for UI without affecting history
  const updateStylesWithoutHistory = useCallback(
    (newStyles: Partial<EmailStyles>) => {
      setCurrentState((current) => ({
        ...current,
        styles: {
          ...current.styles,
          ...newStyles,
        },
      }));
    },
    [],
  );

  // The actual history update function
  const updateHistory = useCallback(
    (state: typeof currentState, force: boolean = false) => {
      // Clear any pending commit timeout
      if (pendingCommitTimeoutRef.current) {
        clearTimeout(pendingCommitTimeoutRef.current);
        pendingCommitTimeoutRef.current = null;
      }

      // Ensure blocks are sorted by order
      const sortedState = {
        ...state,
        blocks: [...state.blocks].sort((a, b) => a.order - b.order),
      };

      setHistory((currentHistory) => {
        // Only add to history if the state has actually changed or if forced
        if (
          !force &&
          JSON.stringify(currentHistory.present) === JSON.stringify(sortedState)
        ) {
          return currentHistory;
        }

        return {
          past: [...currentHistory.past, currentHistory.present],
          present: sortedState,
          future: [],
        };
      });
      lastHistoryUpdate.current = sortedState;
      isDebouncing.current = false;
      pendingHistoryUpdate.current = null;
    },
    [],
  );

  // Create a debounced version of the history update
  const debouncedUpdateHistory = useCallback(
    debounce((state: typeof currentState) => {
      updateHistory(state, true);
    }, 500),
    [updateHistory],
  );

  // Add current state to history
  const addToHistory = useCallback(
    (immediate: boolean = false) => {
      // Clear any pending commit timeout
      if (pendingCommitTimeoutRef.current) {
        clearTimeout(pendingCommitTimeoutRef.current);
        pendingCommitTimeoutRef.current = null;
      }

      // Ensure blocks are sorted by order
      const sortedState = {
        ...currentState,
        blocks: [...currentState.blocks].sort((a, b) => a.order - b.order),
      };

      // Store the current state as pending
      pendingHistoryUpdate.current = sortedState;

      if (immediate) {
        // Cancel any pending debounced updates
        debouncedUpdateHistory.cancel();
        // Update history immediately
        updateHistory(sortedState, true);
      } else {
        // If we're already debouncing, just update the timer
        isDebouncing.current = true;
        debouncedUpdateHistory(sortedState);

        // Set a timeout to force commit if no new changes come in
        pendingCommitTimeoutRef.current = setTimeout(() => {
          if (pendingHistoryUpdate.current) {
            updateHistory(pendingHistoryUpdate.current, true);
          }
        }, 500);
      }
    },
    [currentState, debouncedUpdateHistory, updateHistory],
  );

  // Cleanup debounced function and timeouts on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced updates
      debouncedUpdateHistory.cancel();

      // Clear any pending commit timeout
      if (pendingCommitTimeoutRef.current) {
        clearTimeout(pendingCommitTimeoutRef.current);
      }

      // If there's a pending update, commit it before unmounting
      if (pendingHistoryUpdate.current) {
        updateHistory(pendingHistoryUpdate.current, true);
      }
    };
  }, [debouncedUpdateHistory, updateHistory]);

  const undo = useCallback(() => {
    // If we're in the middle of a debounced update, commit it first
    if (pendingHistoryUpdate.current) {
      debouncedUpdateHistory.cancel();
      updateHistory(pendingHistoryUpdate.current, true);
    }

    let previousState = { blocks: [] as Block[], styles: {} as EmailStyles };
    let currentStateSnapshot = {
      blocks: [] as Block[],
      styles: {} as EmailStyles,
    };

    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (past.length === 0) return currentHistory;

      previousState = past[past.length - 1];
      currentStateSnapshot = present;
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previousState,
        future: [present, ...future],
      };
    });

    // Ensure blocks are sorted by order
    const sortedPreviousState = {
      ...previousState,
      blocks: [...previousState.blocks].sort((a, b) => a.order - b.order),
    };

    // Update the current state to match history
    setCurrentState(sortedPreviousState);

    // Return the previous state and current state for database updates
    return {
      previousState: sortedPreviousState,
      currentState: currentStateSnapshot,
    };
  }, [currentState, debouncedUpdateHistory, updateHistory]);

  const redo = useCallback(() => {
    // If we're in the middle of a debounced update, commit it first
    if (pendingHistoryUpdate.current) {
      debouncedUpdateHistory.cancel();
      updateHistory(pendingHistoryUpdate.current, true);
    }

    let nextState = { blocks: [] as Block[], styles: {} as EmailStyles };
    let currentStateSnapshot = {
      blocks: [] as Block[],
      styles: {} as EmailStyles,
    };

    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (future.length === 0) return currentHistory;

      nextState = future[0];
      currentStateSnapshot = present;
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: nextState,
        future: newFuture,
      };
    });

    // Ensure blocks are sorted by order
    const sortedNextState = {
      ...nextState,
      blocks: [...nextState.blocks].sort((a, b) => a.order - b.order),
    };

    // Update the current state to match history
    setCurrentState(sortedNextState);

    // Return the next state and current state for database updates
    return { nextState: sortedNextState, currentState: currentStateSnapshot };
  }, [currentState, debouncedUpdateHistory, updateHistory]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    // Current state for UI
    blocks: currentState.blocks,
    styles: currentState.styles,
    // History management
    addToHistory,
    updateBlocksWithoutHistory,
    updateStylesWithoutHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
