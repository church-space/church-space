"use client";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import type { Block as BlockType, Section } from "@/types/blocks";
import Block from "./block";
import DndBuilderSidebar from "./sidebar";
import DndBuilderCanvas from "./canvas";

export default function DndProvider() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.data.current?.fromSidebar) {
      const newBlock: BlockType = {
        id: crypto.randomUUID(),
        type: active.data.current.type,
      };

      if (
        over.data.current?.sectionIndex !== undefined &&
        over.data.current?.blockIndex !== undefined
      ) {
        const newSections = [...sections];
        newSections[over.data.current.sectionIndex].blocks.splice(
          over.data.current.blockIndex,
          0,
          newBlock
        );
        setSections(newSections);
      } else if (over.id === "canvas" && sections.length === 0) {
        // Create first section when canvas is empty
        setSections([
          {
            id: crypto.randomUUID(),
            blocks: [newBlock],
          },
        ]);
      }
    } else if (active.data.current?.isSection) {
      // Handle section reordering
      const oldIndex = sections.findIndex(
        (section) => section.id === active.id
      );
      let newIndex = over.data.current?.sectionIndex ?? sections.length;

      if (oldIndex !== newIndex && active.id !== over.id) {
        if (oldIndex < newIndex) newIndex--;
        const newSections = [...sections];
        const [movedSection] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        setSections(newSections);
      }
    }
  };

  const handleDeleteBlock = (sectionIndex: number, blockId: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].blocks = newSections[sectionIndex].blocks.filter(
      (block) => block.id !== blockId
    );
    // Remove section if empty
    if (newSections[sectionIndex].blocks.length === 0) {
      newSections.splice(sectionIndex, 1);
    }
    setSections(newSections);
  };

  const handleAddSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 0, {
      id: crypto.randomUUID(),
      blocks: [],
    });
    setSections(newSections);
  };

  return (
    <DndContext
      id="dnd-builder"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 relative">
        <DndBuilderSidebar type="email" />
        <DndBuilderCanvas
          sections={sections}
          onDeleteBlock={handleDeleteBlock}
          onAddSection={handleAddSection}
        />
      </div>
    </DndContext>
  );
}
