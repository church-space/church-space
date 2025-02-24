"use client";

import type { Block as BlockType } from "@/types/blocks";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useState, useEffect, useCallback } from "react";
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
import { getEmailBlocksQuery } from "@trivo/supabase/get-email-blocks";
import { createClient } from "@trivo/supabase/client";
import { createEmailBlockAction } from "@/actions/create-block";
import { updateEmailBlockAction } from "@/actions/update-block";
import { deleteEmailBlockAction } from "@/actions/delete-block";
import { updateEmailStyleAction } from "@/actions/update-email-style";
import { useToast } from "@trivo/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

// Define allowed block types
type AllowedBlockType =
  | "text"
  | "image"
  | "button"
  | "file-download"
  | "divider"
  | "video"
  | "cards"
  | "list"
  | "spacer";

// Convert database blocks to frontend blocks
const mapDbBlocksToFrontend = (dbBlocks: any[]): BlockType[] => {
  return dbBlocks.map((block) => ({
    id: block.id.toString(),
    type: block.type as BlockType["type"],
    data: block.value || {},
  }));
};

// Convert frontend blocks to database format
const mapFrontendBlockToDb = (
  block: BlockType,
  emailId: number,
  order: number
) => {
  return {
    type: block.type as AllowedBlockType,
    value: block.data,
    order,
    email_id: emailId,
  };
};

interface DndProviderProps {
  emailId: number;
}

export default function DndProvider({ emailId }: DndProviderProps) {
  const { blocks, updateBlocks, undo, redo, canUndo, canRedo } =
    useBlockStateManager([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#f4f4f5");
  const [footerBgColor, setFooterBgColor] = useState("#ffffff");
  const [footerTextColor, setFooterTextColor] = useState("#000000");
  const [footerFont, setFooterFont] = useState("Inter");
  const [editors, setEditors] = useState<Record<string, Editor>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { email, blocks: dbBlocks } = await getEmailBlocksQuery(
          supabase,
          emailId
        );

        // Set email details
        setEmailSubject(email.subject || "");
        setBgColor(email.bg_color || "#f4f4f5");
        setFooterBgColor(email.footer_bg_color || "#ffffff");
        setFooterTextColor(email.footer_text_color || "#000000");
        setFooterFont(email.footer_font || "Inter");

        // Convert DB blocks to frontend format
        const frontendBlocks = mapDbBlocksToFrontend(dbBlocks);
        updateBlocks(frontendBlocks);

        // Set last saved time
        setLastSaved(new Date(email.updated_at || email.created_at));
      } catch (error) {
        console.error("Error fetching email data:", error);
        toast({
          title: "Error",
          description: "Failed to load email data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (emailId) {
      fetchData();
    }
  }, [emailId, toast, updateBlocks]);

  // Save style changes
  const saveStyleChanges = useCallback(async () => {
    try {
      const result = await updateEmailStyleAction({
        emailId,
        updates: {
          bg_color: bgColor,
          footer_bg_color: footerBgColor,
          footer_text_color: footerTextColor,
          footer_font: footerFont,
        },
      });

      if (result && "error" in result && result.error) {
        throw new Error(String(result.error));
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving style changes:", error);
      toast({
        title: "Error",
        description: "Failed to save style changes",
        variant: "destructive",
      });
    }
  }, [bgColor, emailId, footerBgColor, footerFont, footerTextColor, toast]);

  // Auto-save style changes
  useEffect(() => {
    if (!isLoading) {
      const debounceTimer = setTimeout(() => {
        saveStyleChanges();
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [
    bgColor,
    footerBgColor,
    footerTextColor,
    footerFont,
    isLoading,
    saveStyleChanges,
  ]);

  // Handle block creation
  const handleCreateBlock = async (block: BlockType, order: number) => {
    try {
      const dbBlock = mapFrontendBlockToDb(block, emailId, order);

      const result = await createEmailBlockAction({
        blockId: parseInt(block.id) || 0, // Temporary ID
        data: dbBlock,
      });

      if (result && "error" in result && result.error) {
        throw new Error(String(result.error));
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error creating block:", error);
      toast({
        title: "Error",
        description: "Failed to create block",
        variant: "destructive",
      });
    }
  };

  // Handle block update
  const handleUpdateBlock = async (block: BlockType, order: number) => {
    try {
      const blockId = parseInt(block.id);
      if (isNaN(blockId)) return;

      const updates = mapFrontendBlockToDb(block, emailId, order);

      const result = await updateEmailBlockAction({
        blockId,
        updates,
      });

      if (result && "error" in result && result.error) {
        throw new Error(String(result.error));
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error updating block:", error);
      toast({
        title: "Error",
        description: "Failed to update block",
        variant: "destructive",
      });
    }
  };

  // Handle block deletion
  const handleDeleteBlock = async (blockId: string) => {
    try {
      const numericBlockId = parseInt(blockId);
      if (isNaN(numericBlockId)) return;

      const result = await deleteEmailBlockAction({
        blockId: numericBlockId,
      });

      if (result && "error" in result && result.error) {
        throw new Error(String(result.error));
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error deleting block:", error);
      toast({
        title: "Error",
        description: "Failed to delete block",
        variant: "destructive",
      });
    }
  };

  // Save all blocks with updated order
  const saveBlocksWithOrder = async (blocksToSave: BlockType[]) => {
    try {
      // Process each block in sequence
      for (let i = 0; i < blocksToSave.length; i++) {
        const block = blocksToSave[i];
        const blockId = parseInt(block.id);

        if (isNaN(blockId)) {
          // This is a new block that doesn't have a numeric ID yet
          await handleCreateBlock(block, i);
        } else {
          // This is an existing block that needs to be updated
          await handleUpdateBlock(block, i);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving blocks:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  // Auto-save blocks when they change
  useEffect(() => {
    if (!isLoading && blocks.length > 0) {
      const debounceTimer = setTimeout(() => {
        saveBlocksWithOrder(blocks);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [blocks, isLoading]);

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

      const newBlock: BlockType = {
        id: newBlockId,
        type: blockType,
        data:
          blockType === "video"
            ? {
                url: "",
                size: 33,
                centered: false,
              }
            : blockType === "file-download"
              ? {
                  title: "File Name",
                  file: "",
                  bgColor: "#ffffff",
                  textColor: "#000000",
                }
              : blockType === "divider"
                ? { color: "#e2e8f0", margin: 8 }
                : blockType === "button"
                  ? {
                      text: "Button",
                      link: "",
                      color: "#000000",
                      textColor: "#FFFFFF",
                      style: "filled",
                      size: "fit",
                    }
                  : blockType === "list"
                    ? {
                        title: "List Title",
                        subtitle: "List Subtitle",
                        textColor: "#000000",
                        bulletColor: "#000000",
                        bulletType: "number",
                        items: [
                          {
                            title: "First Item",
                            description: "Description here",
                          },
                        ],
                      }
                    : blockType === "cards"
                      ? {
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
                        }
                      : blockType === "image"
                        ? {
                            image: "",
                            size: 33,
                            link: "",
                            centered: false,
                          }
                        : undefined,
      };

      if (blockType === "text") {
        const newEditor = createEditor();
        setEditors((prev) => ({
          ...prev,
          [newBlockId]: newEditor,
        }));
      }

      let newBlocks: BlockType[];
      if (over.id === "canvas") {
        newBlocks = [...blocks, newBlock];
      } else {
        const overIndex = blocks.findIndex((block) => block.id === over.id);
        if (overIndex !== -1) {
          newBlocks = [...blocks];
          const rect = over.rect as DOMRect;
          const mouseY = active.rect.current.translated.top;
          const threshold = rect.top + rect.height / 2;
          const insertIndex = mouseY < threshold ? overIndex : overIndex + 1;
          newBlocks.splice(insertIndex, 0, newBlock);
        } else {
          newBlocks = [...blocks];
        }
      }

      updateBlocks(newBlocks);
      setSelectedBlockId(newBlockId);
    }
  };

  // Delete block handler
  const onDeleteBlock = (id: string) => {
    if (editors[id]) {
      editors[id].destroy();
      setEditors((prev) => {
        const newEditors = { ...prev };
        delete newEditors[id];
        return newEditors;
      });
    }

    // Optimistically update UI
    updateBlocks(blocks.filter((block) => block.id !== id));

    // Then update the database
    handleDeleteBlock(id);

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
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

  const handleBgColorChange = (color: string) => {
    setBgColor(color);
  };

  const handleFooterBgColorChange = (color: string) => {
    setFooterBgColor(color);
  };

  const handleFooterTextColorChange = (color: string) => {
    setFooterTextColor(color);
  };

  const handleFooterFontChange = (font: string) => {
    setFooterFont(font);
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
                <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/emails/${emailId}`}>
                  {emailSubject || "Email"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Editor</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="flex gap-1 mr-2 items-center">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading..."
                : lastSaved
                  ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
                  : "Not saved yet"}
            </p>
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
          <Button
            variant="default"
            onClick={() => saveBlocksWithOrder(blocks)}
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </header>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading email content...</p>
        </div>
      ) : (
        <DndContext
          id="dnd-builder"
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-4 relative">
            <DndBuilderSidebar
              type="email"
              onBgColorChange={handleBgColorChange}
              bgColor={bgColor}
              onFooterBgColorChange={handleFooterBgColorChange}
              footerBgColor={footerBgColor}
              onFooterTextColorChange={handleFooterTextColorChange}
              footerTextColor={footerTextColor}
              onFooterFontChange={handleFooterFontChange}
              footerFont={footerFont}
              selectedBlock={
                selectedBlockId &&
                blocks.find((block) => block.id === selectedBlockId)
                  ? {
                      id: selectedBlockId,
                      type: blocks.find(
                        (block) => block.id === selectedBlockId
                      )!.type,
                    }
                  : null
              }
              setSelectedBlockId={setSelectedBlockId}
              onDeleteBlock={onDeleteBlock}
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
                />
              </SortableContext>
            </div>
          </div>
          <DragOverlay>{renderDragOverlay()}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
