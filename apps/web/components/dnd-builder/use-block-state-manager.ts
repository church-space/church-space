import type { Block } from "@/types/blocks";
import { useCallback, useEffect, useRef, useState } from "react";

// Define the email styles interface
export interface EmailStyles {
  bgColor: string;
  isInset: boolean;
  emailBgColor: string;
  defaultTextColor: string;
  accentTextColor: string;
  defaultFont: string;
  cornerRadius: number;
  blockSpacing: number;
  linkColor: string;
}

// Define a history state interface
export interface HistoryState {
  blocks: Block[];
  styles: EmailStyles;
  footer: any; // Make footer required in history state
}

export function useBlockStateManager(
  initialBlocks: Block[] = [],
  initialStyles: EmailStyles = {
    bgColor: "#ffffff",
    isInset: false,
    emailBgColor: "#eeeeee",
    defaultTextColor: "#000000",
    accentTextColor: "#666666",
    defaultFont: "sans-serif",
    cornerRadius: 0,
    linkColor: "#0000ff",
    blockSpacing: 20,
  },
  initialFooter: any = null, // Add initialFooter parameter
) {
  // Internal state managed by useState
  const [_currentState, _setCurrentState] = useState<HistoryState>({
    blocks: initialBlocks,
    styles: initialStyles,
    footer: initialFooter, // Add footer to initial history state
  });

  // Add state for undo/redo availability to trigger re-renders
  const [canUndoState, setCanUndoState] = useState(false);
  const [canRedoState, setCanRedoState] = useState(false);

  // History management
  const historyRef = useRef<HistoryState[]>([
    { blocks: initialBlocks, styles: initialStyles, footer: initialFooter }, // Add footer to initial history state
  ]);
  const currentIndexRef = useRef<number>(0);
  const maxHistoryLength = 50;
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoOperationRef = useRef<boolean>(false);

  // Function to update the undo/redo state
  const updateUndoRedoState = useCallback(() => {
    setCanUndoState(currentIndexRef.current > 0);
    setCanRedoState(currentIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Add a new state to history
  const addToHistory = useCallback(
    (newState: HistoryState) => {
      // Don't add to history if this is an undo/redo operation
      if (isUndoRedoOperationRef.current) {
        return;
      }

      // Clear any states after the current index
      const newHistory = historyRef.current.slice(
        0,
        currentIndexRef.current + 1,
      );

      // Add the new state
      newHistory.push(newState);

      // Trim history if it exceeds max length
      if (newHistory.length > maxHistoryLength) {
        newHistory.shift();
      }

      // Update refs
      historyRef.current = newHistory;
      currentIndexRef.current = newHistory.length - 1;

      // Update undo/redo state
      updateUndoRedoState();
    },
    [updateUndoRedoState],
  );

  // Batch updates to avoid creating too many history entries for similar operations
  const batchHistoryUpdate = useCallback(
    (newState: HistoryState) => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      // Store the current index before the batch operation
      const indexBeforeBatch = currentIndexRef.current;

      batchTimeoutRef.current = setTimeout(() => {
        // Only add to history if we're still at the same index
        // This prevents issues where undo/redo operations happen during the batch window
        if (currentIndexRef.current === indexBeforeBatch) {
          addToHistory(newState);
        }
        batchTimeoutRef.current = null;
      }, 500); // 500ms batch window
    },
    [addToHistory],
  );

  // New function to update state and manage history
  const setManagedState = useCallback(
    (
      newStateOrFn: HistoryState | ((prevState: HistoryState) => HistoryState),
    ) => {
      let newState: HistoryState;
      if (typeof newStateOrFn === "function") {
        // If it's an updater function, apply it to the current internal state
        // We use _setCurrentState's function form to ensure we get the latest state
        _setCurrentState((prevState) => {
          newState = newStateOrFn(prevState);
          // Add the new state to history using batching inside the updater
          // to ensure it happens after the state is set.
          batchHistoryUpdate(newState);
          return newState; // Return the new state for useState
        });
      } else {
        // If it's a direct state object
        newState = newStateOrFn;
        // Update the internal React state
        _setCurrentState(newState);
        // Add the new state to history using batching
        batchHistoryUpdate(newState);
      }
    },
    [batchHistoryUpdate], // Only depends on batchHistoryUpdate
  );

  // Update blocks immediately for UI and history
  const updateBlocksHistory = useCallback(
    (newBlocks: Block[]) => {
      const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);
      setManagedState((prevState) => ({
        ...prevState,
        blocks: sortedBlocks,
      }));
    },
    [setManagedState], // Depend on the new managed state setter
  );

  // Update styles immediately for UI and history
  const updateStylesHistory = useCallback(
    (newStyles: Partial<EmailStyles>) => {
      setManagedState((prevState) => ({
        ...prevState,
        styles: {
          ...prevState.styles,
          ...newStyles,
        },
      }));
    },
    [setManagedState], // Depend on the new managed state setter
  );

  // Update footer immediately for UI and history
  const updateFooterHistory = useCallback(
    (newFooter: any) => {
      setManagedState((prevState) => ({
        ...prevState,
        footer: newFooter,
      }));
    },
    [setManagedState], // Depend on the new managed state setter
  );

  // Undo function (updated to use internal state setter)
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isUndoRedoOperationRef.current = true;
      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      _setCurrentState(previousState); // Use internal setter
      updateUndoRedoState();
      // Reset the flag after the operation is complete
      setTimeout(() => {
        isUndoRedoOperationRef.current = false;
      }, 0);
      return previousState;
    }
    return null;
  }, [updateUndoRedoState]);

  // Redo function (updated to use internal state setter)
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoOperationRef.current = true;
      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      _setCurrentState(nextState); // Use internal setter
      updateUndoRedoState();
      // Reset the flag after the operation is complete
      setTimeout(() => {
        isUndoRedoOperationRef.current = false;
      }, 0);
      return nextState;
    }
    return null;
  }, [updateUndoRedoState]);

  // Check if undo is available - use the state value for consistent rendering
  const canUndo = useCallback(() => {
    return canUndoState;
  }, [canUndoState]);

  // Check if redo is available - use the state value for consistent rendering
  const canRedo = useCallback(() => {
    return canRedoState;
  }, [canRedoState]);

  // Initialize undo/redo state
  useEffect(() => {
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  return {
    // Current state for UI (use the internal state value)
    blocks: _currentState.blocks,
    styles: _currentState.styles,
    footer: _currentState.footer,
    // Update functions (keep these as they now use setManagedState)
    updateBlocksHistory,
    updateStylesHistory,
    updateFooterHistory,
    // History functions
    undo,
    redo,
    canUndo,
    canRedo,
    // Expose the new managed state setter
    setManagedState, // <--- New function exposed
    // DO NOT expose _setCurrentState directly anymore
  };
}
