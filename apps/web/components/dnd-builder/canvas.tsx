import React from "react";
import Block from "./block";
import { useDroppable } from "@dnd-kit/core";
import type { Block as BlockType } from "@/types/blocks";
import { Editor } from "@tiptap/react";
import { cn } from "@trivo/ui/cn";

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
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: {
      type: "canvas",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 rounded-md py-4 min-h-[200px]",
        isOver && "ring-2 ring-blue-500/50"
      )}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 && (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          Drag blocks here
        </div>
      )}
      {blocks.map((block, index) => (
        <Block
          key={block.id}
          id={block.id}
          type={block.type}
          isSelected={selectedBlockId === block.id}
          onSelect={(e) => {
            e.stopPropagation();
            onBlockSelect(block.id);
          }}
          editor={editors[block.id]}
        />
      ))}
    </div>
  );
}

function DroppableSpot({
  index,
  show,
  isLast,
  nullState,
}: {
  index: number;
  show: boolean;
  isLast: boolean;
  nullState: boolean;
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
        ${nullState ? "h-96 " : ""}
        ${
          isOver
            ? "h-24 border-blue-500 border border-dashed rounded-md bg-blue-500/10"
            : ""
        }`}
    >
      {nullState && (
        <div className="h-96 w-full  flex items-center justify-center">
          no blocks here
        </div>
      )}
    </div>
  );
}
