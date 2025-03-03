"use client";

import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import type { BlockData, Block as BlockType } from "@/types/blocks";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Redo, Undo, LoaderIcon } from "@church-space/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Block from "./block";
import DndBuilderCanvas from "./canvas";
import { useAddEmailBlock } from "./mutations/use-add-email-block";
import { useBatchUpdateEmailBlocks } from "./mutations/use-batch-update-email-blocks";
import { useDeleteEmailBlock } from "./mutations/use-delete-email-block";
import { useUpdateEmailBlock } from "./mutations/use-update-email-block";
import { useUpdateEmailStyle } from "./mutations/use-update-email-style";
import { createEditor } from "./rich-text-editor/editor";
import Toolbar from "./rich-text-editor/rich-text-format-bar";
import DndBuilderSidebar, { allBlockTypes } from "./sidebar";
import { useBlockStateManager, EmailStyles } from "./use-block-state-manager";
import { Eye, SaveIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@church-space/ui/dialog";
import EmailPreview from "./email-preview";
import { useQueryState } from "nuqs";
import SendTestEmail from "./send-test-email";
import { useIsMobile } from "@/hooks/use-is-mobile";

// Define the database-compatible block types to match what's in use-batch-update-email-blocks.ts
type DatabaseBlockType =
  | "cards"
  | "button"
  | "text"
  | "divider"
  | "video"
  | "file-download"
  | "image"
  | "spacer"
  | "list"
  | "author";

// Interface for order updates
interface OrderUpdate {
  id: number;
  order: number;
}

// Interface for content updates
interface ContentUpdate {
  id: number;
  type: DatabaseBlockType;
  value: any;
}

export default function DndProvider() {
  // Move all hooks to the top level
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : undefined;
  const { data: emailData } = useEmailWithBlocks(emailId);
  const addEmailBlock = useAddEmailBlock();
  const deleteEmailBlock = useDeleteEmailBlock();
  const updateEmailBlock = useUpdateEmailBlock();
  const updateEmailStyle = useUpdateEmailStyle();
  const batchUpdateEmailBlocks = useBatchUpdateEmailBlocks();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const [isSaving, setIsSaving] = useState(false);
  const [blocksBeingDeleted, setBlocksBeingDeleted] = useState<Set<string>>(
    new Set()
  );
  const permanentlyDeletedBlocksRef = useRef<Set<string>>(new Set());
  const databaseUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editors, setEditors] = useState<Record<string, Editor>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<
    "default" | "block" | "email-style" | "email-footer" | "email-templates"
  >("default");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Initialize blocks and styles
  const initialBlocks =
    (emailData?.blocks?.map((block) => ({
      id: block.id.toString(),
      type: block.type as BlockType["type"],
      order: block.order || 0,
      data: block.value as unknown as BlockData,
    })) as BlockType[]) || [];

  const initialStyles: EmailStyles = {
    bgColor: emailData?.email?.blocks_bg_color || "#f4f4f5",
    isInset: emailData?.email?.is_inset || false,
    emailBgColor: emailData?.email?.bg_color || "#ffffff",
    linkColor: emailData?.email?.link_color || "#0000ff",
    defaultTextColor: emailData?.email?.default_text_color || "#000000",
    defaultFont: emailData?.email?.default_font || "Inter",
    isRounded: emailData?.email?.is_rounded ?? true,
  };

  const {
    blocks,
    styles,
    addToHistory,
    updateBlocksWithoutHistory,
    updateStylesWithoutHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBlockStateManager(initialBlocks, initialStyles);

  // Create refs to track the latest blocks and styles
  const blocksRef = useRef(blocks);
  const stylesRef = useRef(styles);

  // Update the refs whenever blocks or styles change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    stylesRef.current = styles;
  }, [styles]);

  // Helper function to update block orders in the database
  const updateBlockOrdersInDatabase = useCallback(
    (blocksToUpdate: BlockType[]) => {
      if (!emailId) return;

      const orderUpdates = blocksToUpdate
        .map((block, index) => {
          if (!isNaN(parseInt(block.id, 10))) {
            return {
              id: parseInt(block.id, 10),
              order: index,
            };
          }
          return null;
        })
        .filter(
          (update): update is { id: number; order: number } => update !== null
        );

      // Only update blocks that already exist in the database (have numeric IDs)
      if (orderUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          orderUpdates,
        });
      }
    },
    [emailId, batchUpdateEmailBlocks]
  );

  // Create a ref to track the latest blocks for debounced history updates
  const latestBlocksRef = useRef(blocks);

  // Update the ref whenever blocks change
  useEffect(() => {
    latestBlocksRef.current = blocks;
  }, [blocks]);

  // Create a debounced version of updateEmailBlock for database updates
  const debouncedDatabaseUpdate = useCallback(
    debounce((blockId: number, value: any) => {
      updateEmailBlock.mutate({
        blockId,
        value,
      });
    }, 1000),
    [updateEmailBlock]
  );

  // Update handleTextContentChange
  const handleTextContentChange = (blockId: string, content: string) => {
    // Immediately update the UI with the new content
    const newBlocks = blocks.map((block) => {
      if (block.id === blockId && block.type === "text") {
        return {
          ...block,
          data: {
            ...block.data,
            content,
            font: styles.defaultFont,
            textColor: styles.defaultTextColor,
          } as BlockType["data"],
          order: block.order, // Explicitly preserve the order
        } as BlockType;
      }
      return block;
    });

    // Ensure block order is maintained by sorting
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    // Update the UI immediately without adding to history
    updateBlocksWithoutHistory(sortedBlocks);

    // Add to history - the hook will handle debouncing
    addToHistory();

    // Update in database if we have an emailId and the block exists in the database
    if (emailId && !isNaN(parseInt(blockId, 10))) {
      const dbBlockId = parseInt(blockId, 10);
      const blockToUpdate = blocks.find((block) => block.id === blockId);
      const existingData = (blockToUpdate?.data as any) || {};

      // Debounce the database update
      debouncedDatabaseUpdate(dbBlockId, {
        ...existingData,
        content,
        font: styles.defaultFont,
        textColor: styles.defaultTextColor,
      });
    }
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
        // Create a new blocks array with the reordered blocks
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);

        // Update the order property for each block to match its new position
        const reorderedBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        // Check for duplicate IDs
        const updatedIds = reorderedBlocks.map((block) => block.id);
        const hasDuplicates = updatedIds.some(
          (id, index) => updatedIds.indexOf(id) !== index
        );

        if (hasDuplicates) {
          const seenIds = new Set<string>();
          const deduplicatedBlocks = reorderedBlocks.filter((block) => {
            if (seenIds.has(block.id)) return false;
            seenIds.add(block.id);
            return true;
          });

          updateBlocksWithoutHistory(deduplicatedBlocks);
        } else {
          updateBlocksWithoutHistory(reorderedBlocks);
        }

        // Add to history immediately for block movements
        addToHistory(true);

        // Update order in database for all affected blocks
        if (emailId) {
          updateBlockOrdersInDatabase(reorderedBlocks);
        }
      }
    } else {
      // Handle new blocks from sidebar
      const newBlockId = crypto.randomUUID();
      const blockType = active.data.current.type;

      // Create the block data based on the block type
      let blockData: BlockData;

      if (blockType === "text") {
        blockData = {
          content: "",
          font: styles.defaultFont,
          textColor: styles.defaultTextColor,
        };
      } else if (blockType === "video") {
        blockData = {
          url: "",
          size: 100,
          centered: true,
        };
      } else if (blockType === "file-download") {
        blockData = {
          title: "File Name",
          file: "",
          bgColor: "#ffffff",
          textColor: "#000000",
        };
      } else if (blockType === "divider") {
        blockData = { color: styles.defaultTextColor, margin: 0 };
      } else if (blockType === "button") {
        blockData = {
          text: "Button",
          link: "",
          color: styles.defaultTextColor,
          textColor: "#FFFFFF",
          style: "filled" as "filled" | "outline",
          size: "fit" as "fit" | "full",
          centered: true,
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
              description: "Description",
            },
          ],
        };
      } else if (blockType === "cards") {
        blockData = {
          title: "Cards Title",
          subtitle: "Cards Subtitle",
          textColor: "#000000",
          labelColor: "#4274D2",
          buttonColor: "#4274D2",
          buttonTextColor: "#FFFFFF",
          cards: [
            {
              title: "First Card",
              description: "Card description here",
              label: "",
              buttonText: "Learn More",
              buttonLink: "",
              image: "",
            },
          ],
        };
      } else if (blockType === "image") {
        blockData = {
          image: "",
          size: 100,
          link: "",
          centered: true,
        };
      } else {
        // Default to text block data if type is not recognized
        blockData = { content: "" };
      }

      let newBlocks: BlockType[];
      let newBlockOrder: number;

      // Determine where to insert the new block
      if (over.id === "canvas") {
        // If dropping directly on canvas, add to the end
        newBlockOrder = blocks.length;
      } else {
        // If dropping on an existing block, find its position
        const overIndex = blocks.findIndex((block) => block.id === over.id);
        if (overIndex !== -1) {
          const rect = over.rect as DOMRect;
          const mouseY = active.rect.current.translated.top;
          const threshold = rect.top + rect.height / 2;

          // Insert before or after the target block based on mouse position
          newBlockOrder = mouseY < threshold ? overIndex : overIndex + 1;
        } else {
          // Fallback to end of list
          newBlockOrder = blocks.length;
        }
      }

      // Create the new block with the correct order
      const newBlock: BlockType = {
        id: newBlockId,
        type: blockType,
        order: newBlockOrder,
        data: blockData,
      };

      // Initialize editor for text blocks
      if (blockType === "text") {
        const initialContent =
          blockData && (blockData as any).content
            ? (blockData as any).content
            : "";

        const newEditor = createEditor(
          initialContent,
          styles.defaultFont,
          styles.defaultTextColor,
          false // new blocks should use email defaults
        );
        setEditors((prev) => ({
          ...prev,
          [newBlockId]: newEditor,
        }));
      }

      // Insert the block at the correct position
      newBlocks = [...blocks];
      newBlocks.splice(newBlockOrder, 0, newBlock);

      // Update the order of all blocks after the insertion point
      newBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));

      // Update the local state
      updateBlocksWithoutHistory(newBlocks);

      // Add to history immediately for new blocks
      addToHistory(true);

      // Add the block to the database if we have an emailId
      if (emailId) {
        // First update the UI optimistically
        // Then add to database
        addEmailBlock.mutate(
          {
            emailId,
            type: blockType,
            value: blockData,
            order: newBlockOrder,
            linkedFile: undefined,
          },
          {
            onSuccess: (result) => {
              if (result && result.id) {
                // Update the block ID in our local state to use the database ID
                // but keep the same block in the UI
                const updatedBlocks = newBlocks.map((block) =>
                  block.id === newBlockId
                    ? { ...block, id: result.id.toString() }
                    : block
                );

                // Update the editor reference if this is a text block
                if (blockType === "text") {
                  setEditors((prev) => {
                    const newEditors = { ...prev };
                    if (newEditors[newBlockId]) {
                      // Move the editor reference to the new ID
                      newEditors[result.id.toString()] = newEditors[newBlockId];
                      delete newEditors[newBlockId];
                    }
                    return newEditors;
                  });
                }

                // Check for duplicate IDs
                const updatedBlockIds = updatedBlocks.map((block) => block.id);
                const hasBlockDuplicates = updatedBlockIds.some(
                  (id, index) => updatedBlockIds.indexOf(id) !== index
                );

                if (hasBlockDuplicates) {
                  // Keep only the first occurrence of each ID
                  const seenIds = new Set<string>();
                  const deduplicatedBlocks = updatedBlocks.filter((block) => {
                    if (seenIds.has(block.id)) {
                      return false;
                    }
                    seenIds.add(block.id);
                    return true;
                  });

                  updateBlocksWithoutHistory(deduplicatedBlocks);
                } else {
                  updateBlocksWithoutHistory(updatedBlocks);
                }

                // Set the newly created block as the selected block
                setSelectedBlockId(result.id.toString());

                // Update the order of all blocks in the database to match their position in the UI
                // This ensures blocks after the insertion point have their order properly updated
                updateBlockOrdersInDatabase(updatedBlocks);
              } else {
                console.error(
                  "Failed to add block to database - no ID returned"
                );
              }
            },
            onError: (error) => {
              console.error("Error adding block to database:", error);
              // You could show an error toast here
            },
          }
        );
      }
    }
  };

  // Cleanup editors when blocks are removed
  const handleDeleteBlock = (id: string) => {
    // Safely destroy the editor if it exists
    if (editors[id]) {
      try {
        if (!editors[id].isDestroyed) {
          editors[id].destroy();
        }
      } catch (error) {
        console.error("Error destroying editor:", error);
      }

      setEditors((prev) => {
        const newEditors = { ...prev };
        delete newEditors[id];
        return newEditors;
      });
    }

    // Find the block to be deleted
    const blockToDelete = blocks.find((block) => block.id === id);

    // Add to the set of blocks being deleted
    setBlocksBeingDeleted((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      // If it's a numeric ID, also add the string version
      if (blockToDelete && !isNaN(parseInt(blockToDelete.id, 10))) {
        newSet.add(parseInt(blockToDelete.id, 10).toString());
      }
      return newSet;
    });

    // Also add to permanently deleted blocks
    if (blockToDelete) {
      permanentlyDeletedBlocksRef.current.add(blockToDelete.id);
      if (!isNaN(parseInt(blockToDelete.id, 10))) {
        permanentlyDeletedBlocksRef.current.add(
          parseInt(blockToDelete.id, 10).toString()
        );
      }
    }

    // Update local state
    const updatedBlocks = blocks.filter((block) => block.id !== id);

    // Recalculate order for all blocks
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    updateBlocksWithoutHistory(reorderedBlocks);

    // Add to history immediately for block deletions
    addToHistory(true);

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }

    // Delete from database if we have an emailId and the block exists in the database
    if (emailId && blockToDelete) {
      if (!isNaN(parseInt(blockToDelete.id, 10))) {
        // It's a numeric ID, delete directly
        const blockId = parseInt(blockToDelete.id, 10);
        deleteEmailBlock.mutate(
          { blockId },
          {
            onSuccess: () => {
              // Remove from the set of blocks being deleted
              setBlocksBeingDeleted((prev) => {
                const newSet = new Set(prev);
                newSet.delete(blockToDelete.id);
                newSet.delete(blockId.toString());
                return newSet;
              });

              // Update the order of all remaining blocks in the database
              updateBlockOrdersInDatabase(reorderedBlocks);

              // Invalidate the query to refresh the data
              if (emailId) {
                queryClient.invalidateQueries({ queryKey: ["email", emailId] });
              }
            },
            onError: () => {
              // Remove from the set of blocks being deleted even if there's an error
              setBlocksBeingDeleted((prev) => {
                const newSet = new Set(prev);
                newSet.delete(blockToDelete.id);
                newSet.delete(blockId.toString());
                return newSet;
              });
            },
          }
        );
      } else if (emailData && emailData.blocks) {
        // It's a UUID, we need to find the corresponding database ID

        // Try to find a matching block in the database by comparing properties
        const matchingDbBlock = emailData.blocks.find((dbBlock) => {
          // Match by type and order
          return (
            dbBlock.type === blockToDelete.type &&
            dbBlock.order === blockToDelete.order
          );
        });

        if (matchingDbBlock) {
          // Add the matching DB block ID to permanently deleted blocks
          permanentlyDeletedBlocksRef.current.add(
            matchingDbBlock.id.toString()
          );

          deleteEmailBlock.mutate(
            { blockId: matchingDbBlock.id },
            {
              onSuccess: () => {
                // Remove from the set of blocks being deleted
                setBlocksBeingDeleted((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(blockToDelete.id);
                  newSet.delete(matchingDbBlock.id.toString());
                  return newSet;
                });

                // Update the order of all remaining blocks in the database
                updateBlockOrdersInDatabase(reorderedBlocks);

                // Invalidate the query to refresh the data
                if (emailId) {
                  queryClient.invalidateQueries({
                    queryKey: ["email", emailId],
                  });
                }
              },
              onError: () => {
                // Remove from the set of blocks being deleted even if there's an error
                setBlocksBeingDeleted((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(blockToDelete.id);
                  newSet.delete(matchingDbBlock.id.toString());
                  return newSet;
                });
              },
            }
          );
        } else {
          // Remove from the set of blocks being deleted since there's no database operation
          setBlocksBeingDeleted((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockToDelete.id);
            return newSet;
          });
        }
      }
    } else {
      // Remove from the set of blocks being deleted since there's no database operation
      setBlocksBeingDeleted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        if (blockToDelete) {
          newSet.delete(blockToDelete.id);
        }
        return newSet;
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Safely destroy all editors
      Object.values(editors).forEach((editor) => {
        try {
          if (editor && !editor.isDestroyed) {
            editor.destroy();
          }
        } catch (error) {
          console.error("Error destroying editor during cleanup:", error);
        }
      });
      // Clear the permanently deleted blocks ref when component unmounts
      permanentlyDeletedBlocksRef.current.clear();
    };
  }, []);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
  };

  // Fix handleBlockUpdate to include history update
  const handleBlockUpdate = useCallback(
    (updatedBlock: BlockType, shouldAddToHistory: boolean = true) => {
      // Regular update operation
      const existingBlock = blocks.find(
        (block) => block.id === updatedBlock.id
      );
      if (existingBlock) {
        updatedBlock = {
          ...updatedBlock,
          order: existingBlock.order, // Preserve the existing order
        };
      }
      const newBlocks = blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      );

      // Ensure block order is maintained by explicitly sorting
      const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

      // Always update UI immediately
      updateBlocksWithoutHistory(sortedBlocks);

      // If shouldAddToHistory is true, add to history
      if (shouldAddToHistory) {
        addToHistory();
      }

      // For database updates, debounce the operation
      if (emailId) {
        if (databaseUpdateTimerRef.current) {
          clearTimeout(databaseUpdateTimerRef.current);
        }

        databaseUpdateTimerRef.current = setTimeout(() => {
          if (!isNaN(parseInt(updatedBlock.id, 10))) {
            // Update existing block - include the order in the update
            const dbBlockId = parseInt(updatedBlock.id, 10);
            updateEmailBlock.mutate({
              blockId: dbBlockId,
              value: updatedBlock.data,
              type: updatedBlock.type,
              order: updatedBlock.order, // Explicitly include the order in the update
            });
          }
        }, 1000);
      }
    },
    [
      emailId,
      blocks,
      updateBlocksWithoutHistory,
      addToHistory,
      updateEmailBlock,
    ]
  );

  // Update activeForm when selectedBlock changes
  useEffect(() => {
    if (selectedBlockId) {
      setActiveForm("block");
    } else {
      setActiveForm("default");
    }
  }, [selectedBlockId]);

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

        const overlayEditor = createEditor(
          content,
          styles.defaultFont,
          styles.defaultTextColor,
          false // always use email defaults
        );

        return (
          <Block
            id={draggedBlock.id}
            type={draggedBlock.type}
            isDragging={true}
            editor={overlayEditor}
            isOverlay
            block={draggedBlock}
            defaultFont={styles.defaultFont}
            defaultTextColor={styles.defaultTextColor}
            isRounded={styles.isRounded}
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
          defaultFont={styles.defaultFont}
          defaultTextColor={styles.defaultTextColor}
          isRounded={styles.isRounded}
        />
      );
    }

    return null;
  };

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!emailId) return;

    // Set saving state to true
    setIsSaving(true);

    try {
      // 1. Update email styles
      await updateEmailStyle.mutateAsync({
        emailId,
        updates: {
          blocks_bg_color: styles.bgColor,
          default_text_color: styles.defaultTextColor,
          default_font: styles.defaultFont,
          is_inset: styles.isInset,
          is_rounded: styles.isRounded,
          bg_color: styles.emailBgColor,
          link_color: styles.linkColor,
        },
      });

      // 2. First, add any blocks with UUID IDs to the database
      const blocksWithUUID = blocks.filter(
        (block) =>
          isNaN(parseInt(block.id, 10)) && isValidDatabaseBlockType(block.type)
      );

      // Keep track of the updated blocks
      let currentBlocks = [...blocks];

      // Add each block to the database
      for (const block of blocksWithUUID) {
        try {
          // Keep the block in the UI with its current UUID
          const result = await addEmailBlock.mutateAsync({
            emailId,
            type: block.type,
            value: block.data || ({} as BlockData),
            order: block.order,
            linkedFile: undefined,
          });

          // Update the block ID in our local state but keep the same block in the UI
          if (result && result.id) {
            currentBlocks = currentBlocks.map((b) =>
              b.id === block.id ? { ...b, id: result.id.toString() } : b
            );
          }
        } catch (error) {
          console.error("Error adding block to database:", error);
        }
      }

      // Update blocks with new IDs but keep the same UI
      if (JSON.stringify(currentBlocks) !== JSON.stringify(blocks)) {
        updateBlocksWithoutHistory(currentBlocks);
      }

      // 3. Prepare batch updates for all blocks with database IDs
      const orderUpdates: OrderUpdate[] = currentBlocks
        .map((block, index) => {
          if (!isNaN(parseInt(block.id, 10))) {
            return {
              id: parseInt(block.id, 10),
              order: index,
            };
          }
          return null;
        })
        .filter((update): update is OrderUpdate => update !== null);

      const contentUpdates: ContentUpdate[] = currentBlocks
        .filter(
          (block) =>
            !isNaN(parseInt(block.id, 10)) &&
            isValidDatabaseBlockType(block.type)
        )
        .map((block) => ({
          id: parseInt(block.id, 10),
          type: block.type as DatabaseBlockType,
          value: block.data,
        }));

      // 4. Send batch updates if there are any
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        await batchUpdateEmailBlocks.mutateAsync({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Refresh the email data to get the latest block IDs
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });

      // Navigate to the emails page with the emailId
      router.push(`/emails/${emailId}`);

      // Note: We don't set isSaving to false here because we want the button
      // to remain in loading state during navigation
    } catch (error) {
      console.error("Error saving email:", error);
      // Set saving state to false if there's an error
      setIsSaving(false);
    }
  }, [
    emailId,
    updateEmailStyle,
    batchUpdateEmailBlocks,
    addEmailBlock,
    styles.bgColor,
    styles.defaultTextColor,
    styles.defaultFont,
    styles.isInset,
    styles.isRounded,
    styles.emailBgColor,
    styles.linkColor,
    blocks,
    queryClient,
    router,
  ]);

  // Helper function to check if a block type is valid for the database
  const isValidDatabaseBlockType = (
    type: string
  ): type is DatabaseBlockType => {
    const validTypes: DatabaseBlockType[] = [
      "cards",
      "button",
      "text",
      "divider",
      "video",
      "file-download",
      "image",
      "spacer",
      "list",
      "author",
    ];
    const isValid = validTypes.includes(type as DatabaseBlockType);
    return isValid;
  };

  // Handle undo button click
  const handleUndo = useCallback(() => {
    if (!canUndo) return;

    // Perform the undo operation
    const { previousState, currentState } = undo();

    // Update the database with the changes
    if (emailId) {
      // Find blocks that were actually changed
      const changedBlocks = previousState.blocks.filter((prevBlock) => {
        const currentBlock = currentState.blocks.find(
          (currBlock) => currBlock.id === prevBlock.id
        );
        return (
          !currentBlock ||
          JSON.stringify(prevBlock) !== JSON.stringify(currentBlock)
        );
      });

      // Prepare batch updates for all blocks
      const orderUpdates: OrderUpdate[] = [];
      const contentUpdates: ContentUpdate[] = [];

      // First, collect all order updates since position changes affect all blocks
      previousState.blocks.forEach((block, index) => {
        if (!isNaN(parseInt(block.id, 10))) {
          orderUpdates.push({
            id: parseInt(block.id, 10),
            order: index,
          });
        }
      });

      // Then collect content updates for changed blocks
      changedBlocks.forEach((block) => {
        if (
          !isNaN(parseInt(block.id, 10)) &&
          isValidDatabaseBlockType(block.type)
        ) {
          contentUpdates.push({
            id: parseInt(block.id, 10),
            type: block.type as DatabaseBlockType,
            value: block.data,
          });
        }
      });

      // Send batch updates if there are any changes
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Check if styles changed
      const styleChanges: Record<string, any> = {};
      if (previousState.styles.bgColor !== currentState.styles.bgColor) {
        styleChanges.blocks_bg_color = previousState.styles.bgColor;
      }
      if (previousState.styles.isInset !== currentState.styles.isInset) {
        styleChanges.is_inset = previousState.styles.isInset;
      }
      if (previousState.styles.isRounded !== currentState.styles.isRounded) {
        styleChanges.is_rounded = previousState.styles.isRounded;
      }
      if (
        previousState.styles.emailBgColor !== currentState.styles.emailBgColor
      ) {
        styleChanges.bg_color = previousState.styles.emailBgColor;
      }
      if (previousState.styles.linkColor !== currentState.styles.linkColor) {
        styleChanges.link_color = previousState.styles.linkColor;
      }
      if (
        previousState.styles.defaultTextColor !==
        currentState.styles.defaultTextColor
      ) {
        styleChanges.default_text_color = previousState.styles.defaultTextColor;
      }
      if (
        previousState.styles.defaultFont !== currentState.styles.defaultFont
      ) {
        styleChanges.default_font = previousState.styles.defaultFont;
      }

      // Only update styles if they changed
      if (Object.keys(styleChanges).length > 0) {
        updateEmailStyle.mutate({
          emailId,
          updates: styleChanges,
        });
      }
    }
  }, [canUndo, undo, emailId, updateEmailStyle, batchUpdateEmailBlocks]);

  // Handle redo button click
  const handleRedo = useCallback(() => {
    if (!canRedo) return;

    // Perform the redo operation
    const { nextState, currentState } = redo();

    // Update the database with the changes
    if (emailId) {
      // Find blocks that were actually changed
      const changedBlocks = nextState.blocks.filter((nextBlock) => {
        const currentBlock = currentState.blocks.find(
          (currBlock) => currBlock.id === nextBlock.id
        );
        return (
          !currentBlock ||
          JSON.stringify(nextBlock) !== JSON.stringify(currentBlock)
        );
      });

      // Prepare batch updates for all blocks
      const orderUpdates: OrderUpdate[] = [];
      const contentUpdates: ContentUpdate[] = [];

      // First, collect all order updates since position changes affect all blocks
      nextState.blocks.forEach((block, index) => {
        if (!isNaN(parseInt(block.id, 10))) {
          orderUpdates.push({
            id: parseInt(block.id, 10),
            order: index,
          });
        }
      });

      // Then collect content updates for changed blocks
      changedBlocks.forEach((block) => {
        if (
          !isNaN(parseInt(block.id, 10)) &&
          isValidDatabaseBlockType(block.type)
        ) {
          contentUpdates.push({
            id: parseInt(block.id, 10),
            type: block.type as DatabaseBlockType,
            value: block.data,
          });
        }
      });

      // Send batch updates if there are any changes
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Check if styles changed
      const styleChanges: Record<string, any> = {};
      if (nextState.styles.bgColor !== currentState.styles.bgColor) {
        styleChanges.blocks_bg_color = nextState.styles.bgColor;
      }
      if (nextState.styles.isInset !== currentState.styles.isInset) {
        styleChanges.is_inset = nextState.styles.isInset;
      }
      if (nextState.styles.isRounded !== currentState.styles.isRounded) {
        styleChanges.is_rounded = nextState.styles.isRounded;
      }
      if (nextState.styles.emailBgColor !== currentState.styles.emailBgColor) {
        styleChanges.bg_color = nextState.styles.emailBgColor;
      }
      if (nextState.styles.linkColor !== currentState.styles.linkColor) {
        styleChanges.link_color = nextState.styles.linkColor;
      }
      if (
        nextState.styles.defaultTextColor !==
        currentState.styles.defaultTextColor
      ) {
        styleChanges.default_text_color = nextState.styles.defaultTextColor;
      }
      if (nextState.styles.defaultFont !== currentState.styles.defaultFont) {
        styleChanges.default_font = nextState.styles.defaultFont;
      }

      // Only update styles if they changed
      if (Object.keys(styleChanges).length > 0) {
        updateEmailStyle.mutate({
          emailId,
          updates: styleChanges,
        });
      }
    }
  }, [canRedo, redo, emailId, updateEmailStyle, batchUpdateEmailBlocks]);

  // Function to ensure all database blocks are visible in the UI
  const ensureBlocksVisibility = useCallback(() => {
    if (!emailData || !emailData.blocks || !blocks) return;

    const uiBlockIds = blocks.map((block) => {
      // Convert numeric string IDs to numbers for comparison
      return !isNaN(parseInt(block.id, 10)) ? parseInt(block.id, 10) : block.id;
    });

    // Check for duplicate blocks in UI
    const duplicateIds = uiBlockIds.filter(
      (id, index) => uiBlockIds.indexOf(id) !== index
    );

    if (duplicateIds.length > 0) {
      // Remove duplicates by keeping only the first occurrence of each ID
      const seenIds = new Set();
      const deduplicatedBlocks = blocks.filter((block) => {
        const numericId = !isNaN(parseInt(block.id, 10))
          ? parseInt(block.id, 10)
          : block.id;
        if (seenIds.has(numericId) || seenIds.has(numericId.toString())) {
          return false;
        }
        seenIds.add(numericId);
        seenIds.add(numericId.toString());
        return true;
      });

      if (deduplicatedBlocks.length !== blocks.length) {
        // Sort blocks by order
        const sortedBlocks = [...deduplicatedBlocks].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        updateBlocksWithoutHistory(sortedBlocks);
        return; // Exit early since we've updated the blocks
      }
    }

    // Check for missing blocks (in DB but not in UI)
    const missingBlocks = emailData.blocks.filter((dbBlock) => {
      const blockIdStr = dbBlock.id.toString();
      const isInUI =
        uiBlockIds.includes(dbBlock.id) ||
        uiBlockIds.includes(dbBlock.id.toString());
      const isBeingDeleted =
        blocksBeingDeleted.has(blockIdStr) ||
        blocksBeingDeleted.has(String(dbBlock.id));
      const isPermanentlyDeleted =
        permanentlyDeletedBlocksRef.current.has(blockIdStr) ||
        permanentlyDeletedBlocksRef.current.has(String(dbBlock.id));

      // Only consider blocks that are:
      // 1. Not already in the UI
      // 2. Not currently being deleted
      // 3. Not permanently deleted in this session
      return !isInUI && !isBeingDeleted && !isPermanentlyDeleted;
    });

    if (missingBlocks.length > 0) {
      // Convert database blocks to UI blocks format
      const newUIBlocks = missingBlocks.map((dbBlock) => ({
        id: dbBlock.id.toString(),
        type: dbBlock.type as BlockType["type"],
        order: dbBlock.order || 0,
        data: dbBlock.value as unknown as BlockData,
      }));

      // Combine existing UI blocks with missing blocks
      const combinedBlocks = [...blocks, ...newUIBlocks] as BlockType[];

      // Sort blocks by order
      const sortedBlocks = combinedBlocks.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      updateBlocksWithoutHistory(sortedBlocks);
    }
  }, [emailData, blocks, updateBlocksWithoutHistory, blocksBeingDeleted]);

  // Call ensureBlocksVisibility when emailData changes
  useEffect(() => {
    if (emailData) {
      // Only ensure visibility if we're not in the middle of deleting blocks
      if (blocksBeingDeleted.size === 0) {
        ensureBlocksVisibility();
      }
    }
  }, [emailData, ensureBlocksVisibility, blocksBeingDeleted]);

  // Also call ensureBlocksVisibility after blocks are updated
  useEffect(() => {
    // Use a longer delay to allow server operations to complete
    const timer = setTimeout(() => {
      if (emailData && blocks) {
        // Only ensure visibility if we're not in the middle of deleting blocks
        if (blocksBeingDeleted.size === 0) {
          ensureBlocksVisibility();
        }
      }
    }, 1000); // Longer delay to allow server operations to complete

    return () => clearTimeout(timer);
  }, [blocks, ensureBlocksVisibility, emailData, blocksBeingDeleted]);

  // Filter out blocks that are being deleted from the UI
  const filteredBlocks = blocks.filter((block) => {
    const isBeingDeleted = blocksBeingDeleted.has(block.id);
    const isNumericIdBeingDeleted =
      !isNaN(parseInt(block.id, 10)) &&
      blocksBeingDeleted.has(parseInt(block.id, 10).toString());

    return !isBeingDeleted && !isNumericIdBeingDeleted;
  });

  // Only update if blocks were actually removed
  if (filteredBlocks.length < blocks.length) {
    updateBlocksWithoutHistory(filteredBlocks);
  }

  // Clear blocksBeingDeleted after a timeout to prevent blocks from being permanently excluded
  useEffect(() => {
    if (blocksBeingDeleted.size > 0) {
      const timer = setTimeout(() => {
        setBlocksBeingDeleted(new Set());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [blocksBeingDeleted]);

  const [footerState, setFooterState] = useState<any>(null);

  // Update footerState when emailData changes
  useEffect(() => {
    if (emailData?.footer) {
      setFooterState(emailData.footer);
    }
  }, [emailData?.footer]);

  // Handle footer changes locally before sending to server
  const handleFooterChange = (updatedFooter: any) => {
    // Update local state immediately for responsive UI
    setFooterState(updatedFooter);

    // The actual server update is handled in the EmailFooterForm component
  };

  // Fix handleBgColorChange to include history update
  const handleBgColorChange = useCallback(
    (color: string) => {
      // Update UI immediately
      updateStylesWithoutHistory({ bgColor: color });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            blocks_bg_color: color,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleIsInsetChange to include history update
  const handleIsInsetChange = useCallback(
    (inset: boolean) => {
      // Update UI immediately
      updateStylesWithoutHistory({ isInset: inset });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            is_inset: inset,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleIsRoundedChange to include history update
  const handleIsRoundedChange = useCallback(
    (rounded: boolean) => {
      // Update UI immediately
      updateStylesWithoutHistory({ isRounded: rounded });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            is_rounded: rounded,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleEmailBgColorChange to include history update
  const handleEmailBgColorChange = useCallback(
    (color: string) => {
      // Update UI immediately
      updateStylesWithoutHistory({ emailBgColor: color });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            bg_color: color,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleLinkColorChange to include history update
  const handleLinkColorChange = useCallback(
    (color: string) => {
      // Update UI immediately
      updateStylesWithoutHistory({ linkColor: color });

      // Add to history - the hook will handle debouncing
      addToHistory();

      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: { link_color: color },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleDefaultTextColorChange to include history update
  const handleDefaultTextColorChange = useCallback(
    (color: string) => {
      // Update UI immediately
      updateStylesWithoutHistory({ defaultTextColor: color });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            default_text_color: color,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Fix handleDefaultFontChange to include history update
  const handleDefaultFontChange = useCallback(
    (font: string) => {
      // Update UI immediately
      updateStylesWithoutHistory({ defaultFont: font });

      // Add to history - the hook will handle debouncing
      addToHistory();

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            default_font: font,
          },
        });
      }
    },
    [emailId, updateEmailStyle, updateStylesWithoutHistory, addToHistory]
  );

  // Initialize editors for text blocks
  useEffect(() => {
    const missingEditors = blocks.filter(
      (block) => block.type === "text" && !editors[block.id]
    );

    if (missingEditors.length > 0) {
      const newEditors = { ...editors };
      missingEditors.forEach((block) => {
        // Create a new editor with the block's content
        const initialContent =
          block.data && (block.data as any).content
            ? (block.data as any).content
            : "";

        // Always use the default font and color from email settings
        const newEditor = createEditor(
          initialContent,
          styles.defaultFont,
          styles.defaultTextColor,
          false // always use email defaults
        );
        newEditors[block.id] = newEditor;
      });

      setEditors(newEditors);
    }
  }, [blocks, styles.defaultFont, styles.defaultTextColor]);

  // Update all text blocks when default font or color changes
  useEffect(() => {
    // Skip if there are no blocks or editors
    if (blocks.length === 0 || Object.keys(editors).length === 0) return;

    // Create a flag to check if any blocks actually need updating
    let needsUpdate = false;

    // Update all text blocks to use the new default font and color
    const updatedBlocks = blocks.map((block) => {
      if (block.type === "text") {
        // Get the current content from the editor if available
        const content =
          editors[block.id]?.getHTML() || (block.data as any)?.content || null;

        // Check if this block actually needs updating
        const blockData = (block.data as any) || {};
        if (
          blockData.font !== styles.defaultFont ||
          blockData.textColor !== styles.defaultTextColor
        ) {
          needsUpdate = true;

          // Update the block data to use the default font and color
          return {
            ...block,
            data: {
              ...block.data,
              content,
              font: styles.defaultFont,
              textColor: styles.defaultTextColor,
            } as BlockType["data"],
          };
        }
      }
      return block;
    });

    // Only update if there are actual changes to make
    if (needsUpdate) {
      // Update the blocks without adding to history
      updateBlocksWithoutHistory(updatedBlocks);

      // Update all text editors to use the new font and color
      Object.values(editors).forEach((editor) => {
        if (!editor.isDestroyed) {
          // Set the font and color for the editor
          editor.commands.setFontFamily(styles.defaultFont);
          editor.commands.setColor(styles.defaultTextColor);
        }
      });

      // Update in database if we have an emailId
      if (emailId) {
        // Prepare content updates for all text blocks
        const contentUpdates: ContentUpdate[] = updatedBlocks
          .filter(
            (block) => block.type === "text" && !isNaN(parseInt(block.id, 10))
          )
          .map((block) => ({
            id: parseInt(block.id, 10),
            type: "text" as DatabaseBlockType,
            value: block.data,
          }));

        // Send batch updates if there are any
        if (contentUpdates.length > 0) {
          batchUpdateEmailBlocks.mutate({
            emailId,
            orderUpdates: [],
            contentUpdates,
          });
        }
      }
    }
  }, [
    styles.defaultFont,
    styles.defaultTextColor,
    emailId,
    blocks,
    editors,
    updateBlocksWithoutHistory,
    batchUpdateEmailBlocks,
  ]);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Handle undo (Command/Ctrl + Z)
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        handleUndo();
      }
      // Handle redo (Command/Ctrl + Shift + Z)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "z"
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-full relative">
      <Dialog
        open={isMobile && showMobileWarning}
        onOpenChange={setShowMobileWarning}
      >
        <DialogContent className="rounded-lg max-w-[94%]">
          <DialogHeader>
            <DialogTitle>Mobile Editing (Beta)</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              You are currently using the email editor on a mobile device. While
              we support mobile editing, it is still in beta and you may
              encounter some limitations.
            </p>
            <p className="mt-2">
              For the best experience, we recommend using a desktop computer.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMobileWarning(false)}>
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                <BreadcrumbPage>Designer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
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
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
          <Dialog
            open={previewOpen === "true"}
            onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
          >
            <DialogTrigger asChild>
              <Button variant="ghost">
                <span className="hidden md:block">Preview</span>
                <span className="block md:hidden">
                  <Eye />
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[95%] h-[95%] p-4">
              <DialogHeader className="sr-only">
                <DialogTitle>Preview</DialogTitle>
              </DialogHeader>

              <EmailPreview />
            </DialogContent>
          </Dialog>
          <SendTestEmail />
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            <span className="hidden md:block">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin items-center justify-center flex">
                    <LoaderIcon />
                  </div>
                  <span>Saving...</span>
                </>
              ) : (
                "Save and Exit"
              )}
            </span>
            <span className="block md:hidden">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin items-center justify-center flex">
                    <LoaderIcon />
                  </div>
                </>
              ) : (
                <SaveIcon />
              )}
            </span>
          </Button>
        </div>
      </header>
      <DndContext
        id="dnd-builder"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex md:gap-4 md:p-4 p-2 relative">
          <DndBuilderSidebar
            type="email"
            onBgColorChange={handleBgColorChange}
            bgColor={styles.bgColor}
            defaultTextColor={styles.defaultTextColor}
            onDefaultTextColorChange={handleDefaultTextColorChange}
            defaultFont={styles.defaultFont}
            onDefaultFontChange={handleDefaultFontChange}
            isInset={styles.isInset}
            onIsInsetChange={handleIsInsetChange}
            isRounded={styles.isRounded}
            onIsRoundedChange={handleIsRoundedChange}
            emailBgColor={styles.emailBgColor}
            onEmailBgColorChange={handleEmailBgColorChange}
            selectedBlock={
              selectedBlockId
                ? blocks.find((block) => block.id === selectedBlockId) || null
                : null
            }
            setSelectedBlockId={setSelectedBlockId}
            onDeleteBlock={handleDeleteBlock}
            onBlockUpdate={handleBlockUpdate}
            activeForm={activeForm}
            setActiveForm={setActiveForm}
            emailId={emailId}
            footerData={footerState || emailData?.footer || null}
            onFooterChange={handleFooterChange}
            linkColor={styles.linkColor}
            onLinkColorChange={handleLinkColorChange}
          />
          <div className="flex-1 relative">
            <AnimatePresence>
              {selectedBlockId &&
                blocks.find((block) => block.id === selectedBlockId)?.type ===
                  "text" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 44 }}
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
                bgColor={styles.bgColor}
                isInset={styles.isInset}
                isRounded={styles.isRounded}
                emailBgColor={styles.emailBgColor}
                onBlockSelect={setSelectedBlockId}
                selectedBlockId={selectedBlockId}
                editors={editors}
                onTextContentChange={handleTextContentChange}
                setActiveForm={setActiveForm}
                activeForm={activeForm}
                footerData={footerState || emailData?.footer || null}
                defaultFont={styles.defaultFont}
                defaultTextColor={styles.defaultTextColor}
                linkColor={styles.linkColor}
              />
            </SortableContext>
          </div>
        </div>
        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>
    </div>
  );
}
