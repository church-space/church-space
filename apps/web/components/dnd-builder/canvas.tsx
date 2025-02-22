import React from "react";
import Block from "./block";
import { useDroppable } from "@dnd-kit/core";
import type { Block as BlockType } from "@/types/blocks";

interface CanvasProps {
  blocks: BlockType[];
}

export default function DndBuilderCanvas({ blocks }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-muted rounded-md min-h-[calc(120vh)]`}
    >
      {blocks.length === 0 && <DroppableSpot index={0} />}

      {blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          <DroppableSpot index={index} />
          <Block id={block.id} type={block.type} />
        </React.Fragment>
      ))}

      <DroppableSpot index={blocks.length} />
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
      className={`h-2 w-full transition-all ${
        isOver ? "h-12 bg-primary/20" : ""
      }`}
    />
  );
}
