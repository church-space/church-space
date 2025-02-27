import type { Block } from "@/types/blocks";
import { useCallback, useState } from "react";

// Define the email styles interface
export interface EmailStyles {
  bgColor: string;
  isInset: boolean;
  emailBgColor: string;
  defaultTextColor: string;
  defaultFont: string;
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
  }
) {
  const [history, setHistory] = useState<BlockStateHistory>({
    past: [],
    present: {
      blocks: initialBlocks,
      styles: initialStyles,
    },
    future: [],
  });

  // Update blocks and add to history
  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: {
        ...currentHistory.present,
        blocks: newBlocks,
      },
      future: [],
    }));
  }, []);

  // Update blocks without adding to history - for immediate UI updates
  const updateBlocksWithoutHistory = useCallback((newBlocks: Block[]) => {
    setHistory((currentHistory) => ({
      ...currentHistory,
      present: {
        ...currentHistory.present,
        blocks: newBlocks,
      },
    }));
  }, []);

  // Update styles and add to history
  const updateStyles = useCallback((newStyles: Partial<EmailStyles>) => {
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: {
        ...currentHistory.present,
        styles: {
          ...currentHistory.present.styles,
          ...newStyles,
        },
      },
      future: [],
    }));
  }, []);

  // Update styles without adding to history
  const updateStylesWithoutHistory = useCallback((newStyles: Partial<EmailStyles>) => {
    setHistory((currentHistory) => ({
      ...currentHistory,
      present: {
        ...currentHistory.present,
        styles: {
          ...currentHistory.present.styles,
          ...newStyles,
        },
      },
    }));
  }, []);

  const undo = useCallback(() => {
    let previousState = { blocks: [] as Block[], styles: {} as EmailStyles };
    let currentState = { blocks: [] as Block[], styles: {} as EmailStyles };

    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (past.length === 0) return currentHistory;

      previousState = past[past.length - 1];
      currentState = present;
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previousState,
        future: [present, ...future],
      };
    });

    // Return the previous state and current state for database updates
    return { previousState, currentState };
  }, []);

  const redo = useCallback(() => {
    let nextState = { blocks: [] as Block[], styles: {} as EmailStyles };
    let currentState = { blocks: [] as Block[], styles: {} as EmailStyles };

    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (future.length === 0) return currentHistory;

      nextState = future[0];
      currentState = present;
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: nextState,
        future: newFuture,
      };
    });

    // Return the next state and current state for database updates
    return { nextState, currentState };
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    blocks: history.present.blocks,
    styles: history.present.styles,
    updateBlocks,
    updateBlocksWithoutHistory,
    updateStyles,
    updateStylesWithoutHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
