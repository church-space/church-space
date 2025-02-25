import type { Block as BlockType } from "@/types/blocks";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { Editor } from "@tiptap/react";
import { cn } from "@trivo/ui/cn";
import { motion } from "framer-motion";
import React, { useRef } from "react";
import Block from "./block";

interface CanvasProps {
  blocks: BlockType[];
  bgColor: string;
  onBlockSelect: (id: string | null) => void;
  selectedBlockId: string | null;
  editors: Record<string, Editor | null>;
  onTextContentChange?: (blockId: string, content: string) => void;
}

export default function DndBuilderCanvas({
  blocks,
  bgColor,
  onBlockSelect,
  selectedBlockId,
  editors,
  onTextContentChange,
}: CanvasProps) {
  const { active, over } = useDndContext();
  const isDragging = Boolean(active);
  const isFromSidebar = active?.data?.current?.fromSidebar;
  const activeId = active?.id;

  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  // Store block heights
  const blockRefs = useRef<Record<string, HTMLDivElement>>({});
  const heightRef = useRef<number>(0);

  // When a block becomes active, store its height
  if (active && !heightRef.current && blockRefs.current[active.id]) {
    heightRef.current = blockRefs.current[active.id].offsetHeight;
  }
  // Reset the height when no block is being dragged
  if (!active) {
    heightRef.current = 0;
  }

  const getInsertionIndex = () => {
    if (!over || !active || !isFromSidebar) return -1;

    if (over.id === "canvas" && blocks.length === 0) {
      return 0;
    }

    // If hovering over a block
    const blockIndex = blocks.findIndex((block) => block.id === over.id);
    if (blockIndex !== -1) {
      const rect = over.rect as DOMRect;
      const mouseY = active.rect.current.translated?.top ?? 0;
      const threshold = rect.top + rect.height / 2;

      return mouseY < threshold ? blockIndex : blockIndex + 1;
    }

    return blocks.length;
  };

  const insertionIndex = isDragging ? getInsertionIndex() : -1;

  const renderBlock = (block: BlockType) => {
    const isSelected = selectedBlockId === block.id;
    return (
      <Block
        key={block.id}
        id={block.id}
        type={block.type}
        isSelected={isSelected}
        onSelect={(e) => {
          e.stopPropagation();
          onBlockSelect(block.id);
        }}
        editor={editors[block.id]}
        block={block}
        onTextContentChange={onTextContentChange}
      />
    );
  };

  const renderBlocks = () => {
    console.log("Rendering blocks in canvas:", blocks);
    return blocks.map((block) => renderBlock(block));
  };

  return (
    <div
      ref={setNodeRef}
      className={cn("flex flex-col gap-4 p-4 min-h-[300px] rounded-md")}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {isDragging && isFromSidebar ? (
            <motion.div
              className="h-20 rounded-md border border-dashed border-blue-500 w-full mx-4 max-w-2xl bg-blue-500/10 absolute"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            "Drag blocks here"
          )}
        </div>
      ) : (
        <>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {isDragging && isFromSidebar && insertionIndex === index && (
                <motion.div
                  className="h-20 rounded-md border border-dashed border-blue-500 w-full max-w-2xl mx-auto bg-blue-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <motion.div
                animate={{ y: 0 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                }}
                className={cn("w-full max-w-2xl mx-auto")}
                ref={(el) => {
                  if (el) blockRefs.current[block.id] = el;
                }}
              >
                {activeId === block.id ? (
                  <div style={{ height: `${heightRef.current}px` }} />
                ) : (
                  renderBlock(block)
                )}
              </motion.div>
            </React.Fragment>
          ))}
          {isDragging && isFromSidebar && insertionIndex === blocks.length && (
            <motion.div
              className="h-20 rounded-md border border-dashed border-blue-500 w-full max-w-2xl mx-auto bg-blue-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </>
      )}
    </div>
  );
}
