import { useState, useCallback } from "react";
import type { Block } from "@/types/blocks";

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
    setHistory((currentHistory) => ({
      past: [...currentHistory.past, currentHistory.present],
      present: newBlocks,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (past.length === 0) return currentHistory;

      const previousState = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previousState,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      const { past, present, future } = currentHistory;

      if (future.length === 0) return currentHistory;

      const nextState = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: nextState,
        future: newFuture,
      };
    });
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
