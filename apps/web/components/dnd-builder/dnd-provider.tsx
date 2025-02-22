"use client";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import type { Block as BlockType } from "@/types/blocks";
import Block from "./block";
import DndBuilderSidebar from "./sidebar";
import DndBuilderCanvas from "./canvas";

export default function DndProvider() {
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#f4f4f5");
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

    if (!over) {
      return;
    }

    if (active.data.current?.fromSidebar) {
      const newBlock: BlockType = {
        id: crypto.randomUUID(),
        type: active.data.current.type,
      };

      if (over.data.current?.index !== undefined) {
        const newBlocks = [...blocks];
        newBlocks.splice(over.data.current.index, 0, newBlock);
        setBlocks(newBlocks);
        setSelectedBlockId(newBlock.id);
      } else if (over.id === "canvas") {
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
      }
    } else {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      let newIndex = over.data.current?.index ?? blocks.length;

      if (oldIndex !== newIndex && active.id !== over.id) {
        if (oldIndex < newIndex) {
          newIndex--;
        }

        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, movedBlock);
        setBlocks(newBlocks);
      }
    }
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  return (
    <DndContext
      id="dnd-builder"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 relative">
        <DndBuilderSidebar
          type="email"
          onBgColorChange={setBgColor}
          bgColor={bgColor}
          selectedBlockId={selectedBlockId}
        />
        <DndBuilderCanvas
          blocks={blocks}
          onDeleteBlock={handleDeleteBlock}
          bgColor={bgColor}
          onBlockSelect={setSelectedBlockId}
          selectedBlockId={selectedBlockId}
        />
      </div>
    </DndContext>
  );
}
