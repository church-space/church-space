import React from "react";
import Block from "./block";
import { useDroppable } from "@dnd-kit/core";
import type { Block as BlockType } from "@/types/blocks";

interface CanvasProps {
  blocks: BlockType[];
  onDeleteBlock: (id: string) => void;
}

export default function DndBuilderCanvas({
  blocks,
  onDeleteBlock,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-muted rounded-md min-h-[calc(120vh)] ${
        isOver && blocks.length === 0 ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {blocks.length === 0 ? (
        <DroppableSpot index={0} />
      ) : (
        <>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <DroppableSpot index={index} />
              <Block
                id={block.id}
                type={block.type}
                onDelete={() => onDeleteBlock(block.id)}
              />
            </React.Fragment>
          ))}
          <DroppableSpot index={blocks.length} />
        </>
      )}
    </div>
  );
}

function DroppableSpot({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${index}`,
    data: { index },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-2 mx-auto w-full max-w-2xl transition-all ${
        isOver
          ? "h-24 border-blue-500 border border-dashed rounded-md bg-blue-500/10"
          : ""
      }`}
    />
  );
}
