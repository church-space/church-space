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
}

export default function DndBuilderCanvas({
  blocks,
  bgColor,
  onBlockSelect,
  selectedBlockId,
  editors,
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

  // Calculate the insertion index based on the block being hovered
  const getInsertionIndex = () => {
    if (!over) return -1;

    // If hovering over a block
    const blockIndex = blocks.findIndex((block) => block.id === over.id);
    if (blockIndex !== -1) {
      const rect = over.rect as DOMRect;
      const mouseY = active?.rect.current.translated?.top ?? 0;
      const threshold = rect.top + rect.height / 2;

      return mouseY < threshold ? blockIndex : blockIndex + 1;
    }

    return blocks.length; // Default to end if no valid target
  };

  const insertionIndex = getInsertionIndex();

  return (
    <div
      ref={setNodeRef}
      className={cn("flex-1 rounded-md py-4 min-h-[200px] flex flex-col gap-1")}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Drag blocks here
        </div>
      ) : (
        blocks.map((block, index) => (
          <motion.div
            key={block.id}
            layout="position"
            transition={{
              type: "tween",
              duration: 0.2,
            }}
            className={cn(
              insertionIndex === index &&
                isDragging &&
                "translate-y-12 transition-transform"
            )}
            ref={(el) => {
              if (el) blockRefs.current[block.id] = el;
            }}
          >
            {block.id === activeId ? (
              <div
                className="relative mx-auto w-full max-w-2xl"
                style={{
                  height: blockRefs.current[block.id]?.offsetHeight,
                  padding: "1rem",
                }}
              />
            ) : (
              <Block
                id={block.id}
                type={block.type}
                isSelected={selectedBlockId === block.id}
                onSelect={(e) => {
                  e.stopPropagation();
                  onBlockSelect(block.id);
                }}
                editor={editors[block.id]}
              />
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
