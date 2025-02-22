import React from "react";
import Block from "./block";
import { useDroppable } from "@dnd-kit/core";
import type { Block as BlockType } from "@/types/blocks";
import { Editor } from "@tiptap/react";

interface CanvasProps {
  blocks: BlockType[];
  onDeleteBlock: (id: string) => void;
  bgColor: string;
  onBlockSelect: (id: string | null) => void;
  selectedBlockId: string | null;
  editors: Record<string, Editor | null>;
}

export default function DndBuilderCanvas({
  blocks,
  onDeleteBlock,
  bgColor,
  onBlockSelect,
  selectedBlockId,
  editors,
}: CanvasProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: "canvas",
  });

  // Check if we're dragging an existing block (reordering) or a new block
  const isReordering = active?.data?.current?.type === undefined;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-md py-4`}
      style={{ backgroundColor: bgColor }}
      onClick={() => onBlockSelect(null)}
    >
      {blocks.length === 0 ? (
        <>
          <DroppableSpot
            index={0}
            show={true}
            nullState={true}
            isLast={false}
          />
        </>
      ) : (
        <>
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              <DroppableSpot
                index={index}
                show={!isReordering}
                isLast={false}
                nullState={false}
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
                editor={editors[block.id]}
              />
            </React.Fragment>
          ))}
          <DroppableSpot
            index={blocks.length}
            show={!isReordering}
            isLast={true}
            nullState={false}
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
