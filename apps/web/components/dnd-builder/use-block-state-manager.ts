import type { Block } from "@/types/blocks";
import { useCallback, useRef, useState } from "react";

// Define the email styles interface
export interface EmailStyles {
  bgColor: string;
  isInset: boolean;
  emailBgColor: string;
  defaultTextColor: string;
  accentTextColor: string;
  defaultFont: string;
  isRounded: boolean;
  linkColor: string;
}

// Define a history state interface
interface HistoryState {
  blocks: Block[];
  styles: EmailStyles;
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
    isRounded: true,
    linkColor: "#0000ff",
  },
) {
  // State for current values
  const [currentState, setCurrentState] = useState({
    blocks: initialBlocks,
    styles: initialStyles,
  });

  // History management
  const historyRef = useRef<HistoryState[]>([
    { blocks: initialBlocks, styles: initialStyles },
  ]);
  const currentIndexRef = useRef<number>(0);
  const maxHistoryLength = 50;
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoOperationRef = useRef<boolean>(false);

  // Add a new state to history
  const addToHistory = useCallback((newState: HistoryState) => {
    // Don't add to history if this is an undo/redo operation
    if (isUndoRedoOperationRef.current) {
      return;
    }

    // Clear any states after the current index
    const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);

    // Add the new state
    newHistory.push(newState);

    // Trim history if it exceeds max length
    if (newHistory.length > maxHistoryLength) {
      newHistory.shift();
    }

    // Update refs
    historyRef.current = newHistory;
    currentIndexRef.current = newHistory.length - 1;
  }, []);

  // Batch updates to avoid creating too many history entries for similar operations
  const batchHistoryUpdate = useCallback(
    (newState: HistoryState) => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        addToHistory(newState);
        batchTimeoutRef.current = null;
      }, 500); // 500ms batch window
    },
    [addToHistory],
  );

  // Update blocks immediately for UI
  const updateBlocksHistory = useCallback(
    (newBlocks: Block[]) => {
      // Ensure blocks are sorted by order
      const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

      const newState = {
        blocks: sortedBlocks,
        styles: currentState.styles,
      };

      setCurrentState(newState);

      // Add to history with batching
      batchHistoryUpdate(newState);
    },
    [currentState.styles, batchHistoryUpdate],
  );

  // Update styles immediately for UI
  const updateStylesHistory = useCallback(
    (newStyles: Partial<EmailStyles>) => {
      const newState = {
        blocks: currentState.blocks,
        styles: {
          ...currentState.styles,
          ...newStyles,
        },
      };

      setCurrentState(newState);

      // Add to history with batching
      batchHistoryUpdate(newState);
    },
    [currentState, batchHistoryUpdate],
  );

  // Undo function
  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isUndoRedoOperationRef.current = true;
      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      setCurrentState(previousState);
      isUndoRedoOperationRef.current = false;
      return previousState;
    }
    return null;
  }, []);

  // Redo function
  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoOperationRef.current = true;
      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      setCurrentState(nextState);
      isUndoRedoOperationRef.current = false;
      return nextState;
    }
    return null;
  }, []);

  // Check if undo is available
  const canUndo = useCallback(() => {
    return currentIndexRef.current > 0;
  }, []);

  // Check if redo is available
  const canRedo = useCallback(() => {
    return currentIndexRef.current < historyRef.current.length - 1;
  }, []);

  return {
    // Current state for UI
    blocks: currentState.blocks,
    styles: currentState.styles,
    // Update functions
    updateBlocksHistory,
    updateStylesHistory,
    // History functions
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
