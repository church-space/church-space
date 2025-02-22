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
      className={`flex-1 bg-muted rounded-md min-h-[calc(120vh)] ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      {blocks.map((block) => (
        <Block key={block.id} type={block.type} />
      ))}
    </div>
  );
}
