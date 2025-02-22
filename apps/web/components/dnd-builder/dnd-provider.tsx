"use client";

import type { Block as BlockType } from "@/types/blocks";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import DndBuilderCanvas from "./canvas";
import DndBuilderSidebar from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function DndProvider() {
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#f4f4f5");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

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
    if (id === selectedBlockId) {
      setSelectedBlockId(null);
    }
  };

  return (
    <DndContext id="dnd-builder" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4 relative">
        <DndBuilderSidebar
          type="email"
          onBgColorChange={setBgColor}
          bgColor={bgColor}
          selectedBlock={
            selectedBlockId &&
            blocks.find((block) => block.id === selectedBlockId)
              ? {
                  id: selectedBlockId,
                  type: blocks.find((block) => block.id === selectedBlockId)!
                    .type,
                }
              : null
          }
          setSelectedBlockId={setSelectedBlockId}
        />
        <div className="flex-1 relative">
          <AnimatePresence>
            {selectedBlockId &&
              blocks.find((block) => block.id === selectedBlockId)?.type ===
                "text" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 40 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: 0.2,
                    damping: 20,
                  }}
                  className="sticky top-12 bg-background z-50 overflow-hidden"
                >
                  hi
                </motion.div>
              )}
          </AnimatePresence>
          <DndBuilderCanvas
            blocks={blocks}
            onDeleteBlock={handleDeleteBlock}
            bgColor={bgColor}
            onBlockSelect={setSelectedBlockId}
            selectedBlockId={selectedBlockId}
          />
        </div>
      </div>
    </DndContext>
  );
}
