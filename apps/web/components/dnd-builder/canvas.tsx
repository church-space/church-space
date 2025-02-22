import React from "react";
import Block from "./block";
import { useDroppable } from "@dnd-kit/core";
import type { Block as BlockType } from "@/types/blocks";

interface CanvasProps {
  blocks: BlockType[];
  onDeleteBlock: (id: string) => void;
  bgColor?: string;
  onBlockSelect: (id: string | null) => void;
  selectedBlockId?: string | null;
}

export default function DndBuilderCanvas({
  blocks,
  onDeleteBlock,
  bgColor,
  onBlockSelect,
  selectedBlockId,
}: CanvasProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: "canvas",
  });

  // Check if we're dragging an existing block (reordering) or a new block
  const isReordering = active?.data?.current?.type === undefined;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-md min-h-[calc(100vh-10rem)] ${
        isOver && blocks.length === 0 ? "ring-2 ring-blue-500" : ""
      }`}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <>
          <DroppableSpot index={0} show={!isReordering} isLast={true} />
          <div className="h-28 w-full bg-gray-200">no blocks here</div>
        </>
      ) : (
        <>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <DroppableSpot
                index={index}
                show={!isReordering}
                isLast={false}
              />
              <Block
                id={block.id}
                type={block.type}
                onDelete={() => onDeleteBlock(block.id)}
                isSelected={selectedBlockId === block.id}
                onSelect={(e) => {
                  e.stopPropagation();
                  onBlockSelect(block.id);
                }}
              />
            </React.Fragment>
          ))}
          <DroppableSpot
            index={blocks.length}
            show={!isReordering}
            isLast={true}
          />
        </>
      )}
    </div>
  );
}

function DroppableSpot({
  index,
  show,
  isLast,
}: {
  index: number;
  show: boolean;
  isLast: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${index}`,
    data: { index },
  });

  if (!show) return null;

  return (
    <div
      ref={setNodeRef}
      className={`h-2 mx-auto w-full max-w-2xl transition-all 
        ${isLast ? "h-28" : "h-2"}
        ${
          isOver
            ? "h-24 border-blue-500 border border-dashed rounded-md bg-blue-500/10"
            : ""
        }`}
    />
  );
}
