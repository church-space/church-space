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
  updateBlocks: (blocks: Block[]) => void;
  updateStyles: (styles: Partial<EmailStyles>) => void;
}

// Create Zustand store
export const useBlockStore = create<BlockState>((set) => ({
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
  updateBlocks: (blocks) =>
    set({ blocks: blocks.sort((a, b) => a.order - b.order) }),
  updateStyles: (newStyles) =>
    set((state) => ({ styles: { ...state.styles, ...newStyles } })),
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

  return {
    // Current state for UI
    blocks: currentState.blocks,
    styles: currentState.styles,
    // Update functions
    updateBlocksHistory,
    updateStylesHistory,
  };
}
