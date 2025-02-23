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

function DroppableSpot({ index, isLast }: { index: number; isLast: boolean }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `droppable-${index}`,
    data: { index },
  });

  // Calculate if we're approaching this spot (within 50px)
  const isApproaching =
    active &&
    !isOver &&
    active.rect.current.translated &&
    Math.abs(
      active.rect.current.translated.top -
        (active.rect.current.initial?.top ?? 0 + index * 40)
    ) < 50;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-2 mx-auto w-full max-w-2xl transition-all duration-200",
        isLast && "h-28",
        (isOver || isApproaching) &&
          "h-24 border-blue-500 border-2 border-dashed rounded-md bg-blue-500/10",
        // Make the droppable area larger than it appears
        "before:content-[''] before:absolute before:left-0 before:right-0 before:-top-4 before:-bottom-4 before:z-10"
      )}
    />
  );
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

  // Store block heights
  const blockRefs = useRef<Record<string, HTMLDivElement>>({});

  // Calculate the insertion point based on the block being hovered
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

    // If hovering over a droppable spot
    if (over.id.toString().startsWith("droppable-")) {
      return parseInt(over.id.toString().replace("droppable-", ""));
    }

    return blocks.length; // Default to end if no valid target
  };

  const insertionIndex = getInsertionIndex();

  return (
    <div
      className={cn("flex-1 rounded-md py-4 min-h-[200px] flex flex-col gap-1")}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <DroppableSpot index={0} isLast={true} />
      ) : (
        <>
          {isDragging && isFromSidebar && (
            <DroppableSpot index={0} isLast={false} />
          )}

          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <motion.div
                layout="position"
                transition={{
                  type: "tween",
                  duration: 0.2,
                }}
                className={cn(
                  insertionIndex === index &&
                    isDragging &&
                    "translate-y-24 transition-transform"
                )}
                ref={(el) => {
                  if (el) blockRefs.current[block.id] = el;
                }}
              >
                {block.id === activeId ? (
                  // Placeholder that matches the size of the dragged block
                  <div
                    className="relative mx-auto w-full max-w-2xl "
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
              {isDragging && isFromSidebar && (
                <DroppableSpot
                  index={index + 1}
                  isLast={index === blocks.length - 1}
                />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
}
