import type { Block } from "@/types/blocks";
import { useCallback, useState } from "react";

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
  }
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

  // Update blocks immediately for UI without affecting history
  const updateBlocksWithoutHistory = useCallback((newBlocks: Block[]) => {
    setCurrentState((current) => ({
      ...current,
      blocks: newBlocks,
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
    []
  );

  // Add current state to history (to be debounced)
  const addToHistory = useCallback(() => {
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: currentState,
      future: [],
    }));
  }, [currentState]);

  const undo = useCallback(() => {
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

    // Update the current state to match history
    setCurrentState(previousState);

    // Return the previous state and current state for database updates
    return { previousState, currentState: currentStateSnapshot };
  }, []);

  const redo = useCallback(() => {
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

    // Update the current state to match history
    setCurrentState(nextState);

    // Return the next state and current state for database updates
    return { nextState, currentState: currentStateSnapshot };
  }, []);

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
