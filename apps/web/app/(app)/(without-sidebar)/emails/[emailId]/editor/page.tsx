"use client";
import DndBuilderCanvas from "@/components/dnd-builder/canvas";
import DndBuilderSidebar from "@/components/dnd-builder/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@trivo/ui/breadcrumb";
import { Button } from "@trivo/ui/button";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useState } from "react";
import type { Block } from "@/types/blocks";

export default function Layout() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over?.id === "canvas" && active.data.current?.fromSidebar) {
      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: active.data.current.type,
      };
      setBlocks([...blocks, newBlock]);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full relative">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b sticky top-0 left-0 right-0 bg-background z-10">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Emails</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Email Subject</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <div className="flex gap-1 mr-2 items-center">
              <p className="text-sm text-muted-foreground">
                Saved 12 hours ago
              </p>
            </div>
            <Button variant="outline">Preview</Button>
            <Button variant="outline">Send Test</Button>
            <Button variant="default">Save</Button>
          </div>
        </header>
        <div className="flex gap-4 p-4 relative">
          <DndBuilderSidebar type="email" />
          <DndBuilderCanvas blocks={blocks} />
        </div>
      </div>
    </DndContext>
  );
}
