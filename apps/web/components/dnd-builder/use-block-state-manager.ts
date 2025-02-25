import type { Block } from "@/types/blocks";
import { useCallback, useState } from "react";

interface BlockStateHistory {
  past: Block[][];
  present: Block[];
  future: Block[][];
}

export function useBlockStateManager(initialBlocks: Block[] = []) {
  const [history, setHistory] = useState<BlockStateHistory>({
    past: [],
    present: initialBlocks,
    future: [],
  });

  const updateBlocks = useCallback((newBlocks: Block[]) => {
    console.log("Updating blocks in state manager:", newBlocks);
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: newBlocks,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    let previousState: Block[] = [];
    let currentState: Block[] = [];

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
    let nextState: Block[] = [];
    let currentState: Block[] = [];

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
    blocks: history.present,
    updateBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
