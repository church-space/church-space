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
  // State for current values
  const [currentState, setCurrentState] = useState({
    blocks: initialBlocks,
    styles: initialStyles,
  });

  // Update blocks immediately for UI
  const updateBlocksHistory = useCallback((newBlocks: Block[]) => {
    // Ensure blocks are sorted by order
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    setCurrentState((current) => ({
      ...current,
      blocks: sortedBlocks,
    }));
  }, []);

  // Update styles immediately for UI
  const updateStylesHistory = useCallback((newStyles: Partial<EmailStyles>) => {
    setCurrentState((current) => ({
      ...current,
      styles: {
        ...current.styles,
        ...newStyles,
      },
    }));
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
