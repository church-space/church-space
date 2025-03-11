import type { Block } from "@/types/blocks";
import { create } from "zustand";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface BlockState {
  blocks: Block[];
  styles: EmailStyles;
  history: Block[][];
  currentHistoryIndex: number;
  updateBlocks: (blocks: Block[]) => void;
  updateStyles: (styles: Partial<EmailStyles>) => void;
  addToHistory: (blocks: Block[]) => void;
  undo: () => Block[] | null;
  redo: () => Block[] | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Create Zustand store
export const useBlockStore = create<BlockState>((set, get) => ({
  blocks: [],
  styles: {
    bgColor: "#ffffff",
    isInset: false,
    emailBgColor: "#eeeeee",
    defaultTextColor: "#000000",
    accentTextColor: "#666666",
    defaultFont: "sans-serif",
    isRounded: true,
    linkColor: "#0000ff",
  },
  history: [],
  currentHistoryIndex: -1,
  updateBlocks: (blocks) =>
    set({ blocks: blocks.sort((a, b) => a.order - b.order) }),
  updateStyles: (newStyles) =>
    set((state) => ({ styles: { ...state.styles, ...newStyles } })),
  addToHistory: (blocks) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
      newHistory.push(blocks);
      return {
        history: newHistory,
        currentHistoryIndex: state.currentHistoryIndex + 1,
      };
    }),
  undo: () => {
    const state = get();
    if (state.currentHistoryIndex > 0) {
      const newIndex = state.currentHistoryIndex - 1;
      const blocks = state.history[newIndex];
      set({ currentHistoryIndex: newIndex });
      return blocks;
    }
    return null;
  },
  redo: () => {
    const state = get();
    if (state.currentHistoryIndex < state.history.length - 1) {
      const newIndex = state.currentHistoryIndex + 1;
      const blocks = state.history[newIndex];
      set({ currentHistoryIndex: newIndex });
      return blocks;
    }
    return null;
  },
  canUndo: () => {
    const state = get();
    return state.currentHistoryIndex > 0;
  },
  canRedo: () => {
    const state = get();
    return state.currentHistoryIndex < state.history.length - 1;
  },
}));

export function useBlockStateManager(
  initialBlocks: Block[] = [],
  initialStyles: EmailStyles = useBlockStore.getState().styles,
) {
  // State for current values (UI state)
  const [currentState, setCurrentState] = useState({
    blocks: initialBlocks,
    styles: initialStyles,
  });

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize store with initial values
  useEffect(() => {
    useBlockStore.getState().updateBlocks(initialBlocks);
    useBlockStore.getState().updateStyles(initialStyles);
    // Initialize history with initial blocks
    useBlockStore.getState().addToHistory(initialBlocks);
  }, [initialBlocks, initialStyles]);

  // Update blocks immediately for UI
  const updateBlocksHistory = useCallback((newBlocks: Block[]) => {
    // Ensure blocks are sorted by order
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    // Update local state immediately for UI
    setCurrentState((current) => ({
      ...current,
      blocks: sortedBlocks,
    }));

    // Add to history
    useBlockStore.getState().addToHistory(sortedBlocks);

    // Debounce the update to Zustand store
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      useBlockStore.getState().updateBlocks(sortedBlocks);
    }, 1000); // 1 second debounce
  }, []);

  // Update styles immediately for UI
  const updateStylesHistory = useCallback((newStyles: Partial<EmailStyles>) => {
    // Update local state immediately for UI
    setCurrentState((current) => ({
      ...current,
      styles: {
        ...current.styles,
        ...newStyles,
      },
    }));

    // Debounce the update to Zustand store
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      useBlockStore.getState().updateStyles(newStyles);
    }, 1000); // 1 second debounce
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Get undo/redo state
  const canUndo = useBlockStore((state) => state.canUndo());
  const canRedo = useBlockStore((state) => state.canRedo());

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    const blocks = useBlockStore.getState().undo();
    if (blocks) {
      setCurrentState((current) => ({
        ...current,
        blocks,
      }));
      return blocks;
    }
    return null;
  }, []);

  const handleRedo = useCallback(() => {
    const blocks = useBlockStore.getState().redo();
    if (blocks) {
      setCurrentState((current) => ({
        ...current,
        blocks,
      }));
      return blocks;
    }
    return null;
  }, []);

  return {
    // Current state for UI
    blocks: currentState.blocks,
    styles: currentState.styles,
    // Update functions
    updateBlocksHistory,
    updateStylesHistory,
    // Undo/redo
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  };
}
