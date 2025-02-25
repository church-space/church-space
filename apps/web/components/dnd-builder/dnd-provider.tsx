"use client";

import type { Block as BlockType, BlockData } from "@/types/blocks";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import DndBuilderCanvas from "./canvas";
import DndBuilderSidebar from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import Toolbar from "./rich-text-editor/rich-text-format-bar";
import { createEditor } from "./rich-text-editor/editor";
import { Editor } from "@tiptap/react";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { allBlockTypes } from "./sidebar"; // We'll need to export this from sidebar
import Block from "./block";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@trivo/ui/breadcrumb";
import { Button } from "@trivo/ui/button";
import { Undo, Redo } from "@trivo/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@trivo/ui/tooltip";
import { useBlockStateManager } from "./use-block-state-manager";
import { debounce } from "lodash";
import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { useParams } from "next/navigation";
import { useAddEmailBlock } from "./mutations/use-add-email-block";
import { useDeleteEmailBlock } from "./mutations/use-delete-email-block";

export default function DndProvider() {
  const params = useParams();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;
  const { data: emailData, isLoading } = useEmailWithBlocks(emailId);
  const addEmailBlock = useAddEmailBlock();
  const deleteEmailBlock = useDeleteEmailBlock();

  // Initialize blocks from the fetched data or use empty array
  const initialBlocks =
    (emailData?.blocks?.map((block) => ({
      id: block.id.toString(),
      type: block.type as BlockType["type"],
      order: block.order || 0,
      data: block.value as unknown as BlockData,
    })) as BlockType[]) || [];

  const { blocks, updateBlocks, undo, redo, canUndo, canRedo } =
    useBlockStateManager(initialBlocks);

  // Initialize bgColor from the fetched data or use default
  const [bgColor, setBgColor] = useState(
    emailData?.email?.bg_color || "#f4f4f5"
  );

  // Update bgColor when email data is loaded
  useEffect(() => {
    if (emailData?.email?.bg_color) {
      setBgColor(emailData.email.bg_color);
    }
  }, [emailData]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editors, setEditors] = useState<Record<string, Editor>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Initialize editors for text blocks
  useEffect(() => {
    const missingEditors = blocks.filter(
      (block) => block.type === "text" && !editors[block.id]
    );

    if (missingEditors.length > 0) {
      const newEditors = { ...editors };
      missingEditors.forEach((block) => {
        newEditors[block.id] = createEditor();
      });

      setEditors(newEditors);
    }
  }, [blocks, editors]);

  // Create a debounced version of updateBlocks
  const debouncedUpdateBlocks = debounce((newBlocks: BlockType[]) => {
    updateBlocks(newBlocks);
  }, 500);

  // Add handler for text content updates
  const handleTextContentChange = (blockId: string, content: string) => {
    const newBlocks = blocks.map((block) => {
      if (block.id === blockId && block.type === "text") {
        return {
          ...block,
          data: {
            content,
          } as BlockType["data"],
        } as BlockType;
      }
      return block;
    });

    debouncedUpdateBlocks(newBlocks);
  };

  // Handle drag end and block creation
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (!active.data.current?.fromSidebar) {
      // Handle reordering of existing blocks
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Store current editors state and their content
        const currentEditors = { ...editors };
        const editorContents: Record<string, string> = {};

        // Only store content for the moved editor
        const movedBlock = blocks[oldIndex];
        if (!movedBlock) return;

        const movedBlockId = movedBlock.id;
        if (
          currentEditors[movedBlockId] &&
          !currentEditors[movedBlockId].isDestroyed
        ) {
          editorContents[movedBlockId] = currentEditors[movedBlockId].getHTML();
          currentEditors[movedBlockId].destroy();
        }

        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        updateBlocks(newBlocks);

        // Use RAF to ensure DOM is ready before editor updates
        requestAnimationFrame(() => {
          const updatedEditors = { ...currentEditors };

          // Only recreate the moved editor if it exists and is a text block
          const movedBlockInNewPosition = newBlocks[newIndex];
          if (
            movedBlockInNewPosition &&
            movedBlockInNewPosition.type === "text"
          ) {
            const newEditor = createEditor();
            if (editorContents[movedBlockId]) {
              newEditor.commands.setContent(editorContents[movedBlockId]);
            }
            updatedEditors[movedBlockId] = newEditor;
          }

          setEditors(updatedEditors);
        });
      }
    } else {
      // Handle new blocks from sidebar
      const newBlockId = crypto.randomUUID();
      const blockType = active.data.current.type;

      // Create the block data based on the block type
      let blockData: BlockData;

      if (blockType === "text") {
        blockData = { content: "" };
      } else if (blockType === "video") {
        blockData = {
          url: "",
          size: 33,
          centered: false,
        };
      } else if (blockType === "file-download") {
        blockData = {
          title: "File Name",
          file: "",
          bgColor: "#ffffff",
          textColor: "#000000",
        };
      } else if (blockType === "divider") {
        blockData = { color: "#e2e8f0", margin: 8 };
      } else if (blockType === "button") {
        blockData = {
          text: "Button",
          link: "",
          color: "#000000",
          textColor: "#FFFFFF",
          style: "filled" as "filled" | "outline",
          size: "fit" as "fit" | "full",
        };
      } else if (blockType === "list") {
        blockData = {
          title: "List Title",
          subtitle: "List Subtitle",
          textColor: "#000000",
          bulletColor: "#000000",
          bulletType: "number" as "number" | "bullet",
          items: [
            {
              title: "First Item",
              description: "Description here",
            },
          ],
        };
      } else if (blockType === "cards") {
        blockData = {
          title: "Cards Title",
          subtitle: "Cards Subtitle",
          cards: [
            {
              title: "First Card",
              description: "Card description here",
              label: "Label",
              buttonText: "Learn More",
              buttonLink: "",
              image: "",
            },
          ],
        };
      } else if (blockType === "image") {
        blockData = {
          image: "",
          size: 33,
          link: "",
          centered: false,
        };
      } else {
        // Default to text block data if type is not recognized
        blockData = { content: "" };
      }

      const newBlock: BlockType = {
        id: newBlockId,
        type: blockType,
        order: blocks.length,
        data: blockData,
      };

      if (blockType === "text") {
        const newEditor = createEditor();
        setEditors((prev) => ({
          ...prev,
          [newBlockId]: newEditor,
        }));
      }

      let newBlocks: BlockType[];
      let newBlockOrder: number;

      if (over.id === "canvas") {
        newBlocks = [...blocks, newBlock];
        newBlockOrder = blocks.length;
      } else {
        const overIndex = blocks.findIndex((block) => block.id === over.id);
        if (overIndex !== -1) {
          newBlocks = [...blocks];
          const rect = over.rect as DOMRect;
          const mouseY = active.rect.current.translated.top;
          const threshold = rect.top + rect.height / 2;
          const insertIndex = mouseY < threshold ? overIndex : overIndex + 1;
          newBlocks.splice(insertIndex, 0, newBlock);
          newBlockOrder = insertIndex;
        } else {
          newBlocks = [...blocks, newBlock];
          newBlockOrder = blocks.length;
        }
      }

      // Update the local state
      updateBlocks(newBlocks);
      setSelectedBlockId(newBlockId);

      // Add the block to the database if we have an emailId
      if (emailId) {
        addEmailBlock.mutate({
          emailId,
          type: blockType,
          value: blockData,
          order: newBlockOrder,
          linkedFile: undefined,
        });
      }
    }
  };

  // Cleanup editors when blocks are removed
  const handleDeleteBlock = (id: string) => {
    if (editors[id]) {
      editors[id].destroy();
      setEditors((prev) => {
        const newEditors = { ...prev };
        delete newEditors[id];
        return newEditors;
      });
    }

    // Find the block to be deleted
    const blockToDelete = blocks.find((block) => block.id === id);

    // Update local state
    updateBlocks(blocks.filter((block) => block.id !== id));

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }

    // Delete from database if we have an emailId and the block exists in the database
    if (emailId && blockToDelete && !isNaN(parseInt(blockToDelete.id, 10))) {
      const blockId = parseInt(blockToDelete.id, 10);
      deleteEmailBlock.mutate({ blockId });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(editors).forEach((editor) => {
        if (editor && !editor.isDestroyed) {
          editor.destroy();
        }
      });
    };
  }, [editors]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleBlockUpdate = (updatedBlock: BlockType) => {
    const newBlocks = blocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    updateBlocks(newBlocks);
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    // If it's from sidebar (new block)
    if (activeId.toString().startsWith("sidebar-")) {
      const blockType = activeId.replace("sidebar-", "");
      const blockData = allBlockTypes.find((b) => b.type === blockType);

      if (blockData) {
        return (
          <div className="flex flex-col items-center gap-1 bg-accent p-3 rounded-md cursor-grab border shadow-sm opacity-80">
            <blockData.icon />
            <span>{blockData.label}</span>
          </div>
        );
      }
    }

    // If it's an existing block
    const draggedBlock = blocks.find((block) => block.id === activeId);
    if (draggedBlock) {
      // For text blocks, create a temporary editor for the overlay
      if (draggedBlock.type === "text" && editors[draggedBlock.id]) {
        const content = editors[draggedBlock.id]?.getHTML() || "";
        const overlayEditor = createEditor();
        overlayEditor.commands.setContent(content);

        return (
          <Block
            id={draggedBlock.id}
            type={draggedBlock.type}
            isDragging={true}
            editor={overlayEditor}
            isOverlay
            block={draggedBlock}
          />
        );
      }

      return (
        <Block
          id={draggedBlock.id}
          type={draggedBlock.type}
          isDragging={true}
          editor={editors[draggedBlock.id]}
          isOverlay
          block={draggedBlock}
        />
      );
    }

    return null;
  };

  return (
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
                <BreadcrumbLink href="/">
                  {emailData?.email?.subject || "Email Subject"}
                </BreadcrumbLink>
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
            <p className="text-sm text-muted-foreground">Saved 12 hours ago</p>
          </div>
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  <Undo />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
          <Button variant="outline">Preview</Button>
          <Button variant="outline">Send Test</Button>
          <Button variant="default">Save</Button>
        </div>
      </header>
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
            onDeleteBlock={handleDeleteBlock}
            onBlockUpdate={handleBlockUpdate}
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
                    transition={{ duration: 0.2, damping: 20 }}
                    className="sticky top-12 bg-background z-50 overflow-hidden "
                  >
                    <Toolbar editor={editors[selectedBlockId]} />
                  </motion.div>
                )}
            </AnimatePresence>
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <DndBuilderCanvas
                blocks={blocks}
                bgColor={bgColor}
                onBlockSelect={setSelectedBlockId}
                selectedBlockId={selectedBlockId}
                editors={editors}
                onTextContentChange={handleTextContentChange}
              />
            </SortableContext>
          </div>
        </div>
        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>
    </div>
  );
}
