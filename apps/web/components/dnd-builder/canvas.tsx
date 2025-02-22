import React from "react";
import { Plus } from "@trivo/ui/icons";
import Block from "./block";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import type { Block as BlockType, Section } from "@/types/blocks";

interface CanvasProps {
  sections: Section[];
  onDeleteBlock: (sectionIndex: number, blockId: string) => void;
  onAddSection: (index: number) => void;
}

export default function DndBuilderCanvas({
  sections,
  onDeleteBlock,
  onAddSection,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-muted rounded-md min-h-[calc(100vh-10rem)] ${
        isOver && sections.length === 0 ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {sections.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Drag blocks here to create a section
        </div>
      ) : (
        <>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.id}>
              <SectionAddButton onClick={() => onAddSection(sectionIndex)} />
              <Section
                section={section}
                index={sectionIndex}
                onDeleteBlock={onDeleteBlock}
              />
            </React.Fragment>
          ))}
          <SectionAddButton onClick={() => onAddSection(sections.length)} />
        </>
      )}
    </div>
  );
}

function Section({
  section,
  index,
  onDeleteBlock,
}: {
  section: Section;
  index: number;
  onDeleteBlock: (sectionIndex: number, blockId: string) => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: section.id,
    data: { isSection: true, sectionIndex: index },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-background rounded-lg my-4 p-4 cursor-move"
    >
      {section.blocks.map((block, blockIndex) => (
        <React.Fragment key={block.id}>
          <DroppableSpot sectionIndex={index} blockIndex={blockIndex} />
          <Block
            id={block.id}
            type={block.type}
            onDelete={() => onDeleteBlock(index, block.id)}
          />
        </React.Fragment>
      ))}
      <DroppableSpot sectionIndex={index} blockIndex={section.blocks.length} />
    </div>
  );
}

function SectionAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center py-2 opacity-0 hover:opacity-100 transition-opacity group"
    >
      <div className="bg-primary/10 hover:bg-primary/20 rounded-full p-1">
        <Plus />
      </div>
    </button>
  );
}

function DroppableSpot({
  sectionIndex,
  blockIndex,
}: {
  sectionIndex: number;
  blockIndex: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${sectionIndex}-${blockIndex}`,
    data: { sectionIndex, blockIndex },
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
