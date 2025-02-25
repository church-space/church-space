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
} from "@trivo/ui/breadcrumb";
import { Button } from "@trivo/ui/button";
import { Redo, Undo } from "@trivo/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@trivo/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { useParams } from "next/navigation";
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
import { useBlockStateManager } from "./use-block-state-manager";

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
  const params = useParams();
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

  // Track blocks that are being deleted to prevent them from being re-added
  const [blocksBeingDeleted, setBlocksBeingDeleted] = useState<Set<string>>(
    new Set()
  );

  // Add a ref to track blocks that have been deleted during the session
  const permanentlyDeletedBlocksRef = useRef<Set<string>>(new Set());

  // Initialize blocks from the fetched data or use empty array
  const initialBlocks =
    (emailData?.blocks?.map((block) => ({
      id: block.id.toString(),
      type: block.type as BlockType["type"],
      order: block.order || 0,
      data: block.value as unknown as BlockData,
    })) as BlockType[]) || [];

  const {
    blocks,
    updateBlocks,
    updateBlocksWithoutHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBlockStateManager(initialBlocks);

  // Create a ref to track the latest blocks
  const blocksRef = useRef(blocks);

  // Update the ref whenever blocks change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

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
        console.log("Updating order for blocks:", orderUpdates);
        batchUpdateEmailBlocks.mutate({
          emailId,
          orderUpdates,
        });
      }
    },
    [emailId, batchUpdateEmailBlocks]
  );

  // Initialize bgColor from the fetched data or use default
  const [bgColor, setBgColor] = useState(
    emailData?.email?.bg_color || "#f4f4f5"
  );

  // Initialize footer styles from the fetched data or use defaults
  const [footerBgColor, setFooterBgColor] = useState(
    emailData?.email?.footer_bg_color || "#ffffff"
  );
  const [footerTextColor, setFooterTextColor] = useState(
    emailData?.email?.footer_text_color || "#000000"
  );
  const [footerFont, setFooterFont] = useState(
    emailData?.email?.footer_font || "Inter"
  );

  // Update bgColor when email data is loaded
  useEffect(() => {
    if (emailData?.email?.bg_color) {
      setBgColor(emailData.email.bg_color);
    }
  }, [emailData]);

  // Update block IDs when email data is loaded
  useEffect(() => {
    if (emailData?.blocks && blocksRef.current.length > 0) {
      // Check for blocks with UUID IDs that might have corresponding database blocks
      const blocksWithUUID = blocksRef.current.filter((block) =>
        isNaN(parseInt(block.id, 10))
      );

      if (blocksWithUUID.length > 0) {
        console.log(
          "Checking for blocks with UUID that need updating:",
          blocksWithUUID
        );

        // Create a new blocks array with updated IDs
        const updatedBlocks = blocksRef.current.map((block) => {
          // Skip blocks that already have numeric IDs
          if (!isNaN(parseInt(block.id, 10))) {
            return block;
          }

          // Try to find a matching block in the database
          // First try to match by type and order
          let matchingDbBlock = emailData.blocks.find(
            (dbBlock) =>
              dbBlock.type === block.type && dbBlock.order === block.order
          );

          // If no match found, try to match by content similarity
          if (!matchingDbBlock && block.data) {
            matchingDbBlock = emailData.blocks.find((dbBlock) => {
              if (dbBlock.type !== block.type) return false;

              // For text blocks, compare content
              if (block.type === "text" && dbBlock.value && block.data) {
                const dbValue = dbBlock.value as any;
                const blockData = block.data as any;
                return dbValue.content === blockData.content;
              }

              // For author blocks, compare name and subtitle
              if (block.type === "author" && dbBlock.value && block.data) {
                const dbValue = dbBlock.value as any;
                const blockData = block.data as any;
                return (
                  dbValue.name === blockData.name &&
                  dbValue.subtitle === blockData.subtitle
                );
              }

              return false;
            });
          }

          if (matchingDbBlock) {
            console.log(
              `Updating block ID from ${block.id} to ${matchingDbBlock.id}`
            );
            return { ...block, id: matchingDbBlock.id.toString() };
          }

          return block;
        });

        // Only update if there were changes
        const hasChanges = updatedBlocks.some(
          (block, index) => block.id !== blocksRef.current[index].id
        );
        if (hasChanges) {
          console.log("Updating blocks with database IDs");
          updateBlocks(updatedBlocks);
        }
      }
    }
  }, [emailData]); // Only depend on emailData to avoid infinite loops

  // Update footer styles when email data is loaded
  useEffect(() => {
    if (emailData?.email) {
      if (emailData.email.footer_bg_color) {
        setFooterBgColor(emailData.email.footer_bg_color);
      }
      if (emailData.email.footer_text_color) {
        setFooterTextColor(emailData.email.footer_text_color);
      }
      if (emailData.email.footer_font) {
        setFooterFont(emailData.email.footer_font);
      }
    }
  }, [emailData]);

  // Create a debounced handler for background color changes
  const handleBgColorChange = useCallback(
    debounce((color: string) => {
      setBgColor(color);

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            bg_color: color,
          },
        });
      }
    }, 500),
    [emailId, updateEmailStyle]
  );

  // Create a debounced handler for footer background color changes
  const handleFooterBgColorChange = useCallback(
    debounce((color: string) => {
      setFooterBgColor(color);

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            footer_bg_color: color,
          },
        });
      }
    }, 500),
    [emailId, updateEmailStyle]
  );

  // Create a debounced handler for footer text color changes
  const handleFooterTextColorChange = useCallback(
    debounce((color: string) => {
      setFooterTextColor(color);

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            footer_text_color: color,
          },
        });
      }
    }, 500),
    [emailId, updateEmailStyle]
  );

  // Create a debounced handler for footer font changes
  const handleFooterFontChange = useCallback(
    debounce((font: string) => {
      setFooterFont(font);

      // Update in database if we have an emailId
      if (emailId) {
        updateEmailStyle.mutate({
          emailId,
          updates: {
            footer_font: font,
          },
        });
      }
    }, 500),
    [emailId, updateEmailStyle]
  );

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

  // Create a ref to track the latest blocks for debounced history updates
  const latestBlocksRef = useRef(blocks);

  // Update the ref whenever blocks change
  useEffect(() => {
    latestBlocksRef.current = blocks;
  }, [blocks]);

  // Create a debounced version of updateBlocks for history updates only
  const debouncedHistoryUpdate = useCallback(
    debounce(() => {
      console.log("Debounced history update for blocks");
      // This is a no-op update that just adds the current state to history
      // without changing the current state
      updateBlocks([...latestBlocksRef.current]);
    }, 500),
    [updateBlocks]
  );

  // Add handler for text content updates
  const handleTextContentChange = (blockId: string, content: string) => {
    // Immediately update the UI with the new content
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

    // Update the UI immediately without adding to history
    updateBlocksWithoutHistory(newBlocks);

    // Debounce the history update
    debouncedHistoryUpdate();

    // Update in database if we have an emailId and the block exists in the database
    if (emailId && !isNaN(parseInt(blockId, 10))) {
      const dbBlockId = parseInt(blockId, 10);
      updateEmailBlock.mutate({
        blockId: dbBlockId,
        value: { content },
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

        // Update order in database for all affected blocks
        if (emailId) {
          // Use the helper function to update block orders in the database
          updateBlockOrdersInDatabase(newBlocks);
        }

        // Check for duplicate IDs
        const updatedIds = newBlocks.map((block) => block.id);
        const hasDuplicates = updatedIds.some(
          (id, index) => updatedIds.indexOf(id) !== index
        );

        if (hasDuplicates) {
          console.log(
            "Found duplicate IDs after reordering, removing duplicates"
          );

          // Keep only the first occurrence of each ID
          const seenIds = new Set<string>();
          const deduplicatedBlocks = newBlocks.filter((block) => {
            if (seenIds.has(block.id)) {
              return false;
            }
            seenIds.add(block.id);
            return true;
          });

          updateBlocks(deduplicatedBlocks);
        } else {
          updateBlocks(newBlocks);
        }

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
        const newEditor = createEditor();
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
      console.log(
        "Adding new block to UI:",
        newBlock,
        "at position:",
        newBlockOrder
      );
      updateBlocks(newBlocks);

      // Add the block to the database if we have an emailId
      if (emailId) {
        // First update the UI optimistically
        console.log("Optimistically adding block to UI:", newBlock);

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
                console.log("Block added to database with ID:", result.id);
                // Update the block ID in our local state to use the database ID
                // but keep the same block in the UI
                const updatedBlocks = newBlocks.map((block) =>
                  block.id === newBlockId
                    ? { ...block, id: result.id.toString() }
                    : block
                );

                // Check for duplicate IDs
                const updatedIds = updatedBlocks.map((block) => block.id);
                const hasDuplicates = updatedIds.some(
                  (id, index) => updatedIds.indexOf(id) !== index
                );

                if (hasDuplicates) {
                  console.log(
                    "Found duplicate IDs after adding, removing duplicates"
                  );

                  // Keep only the first occurrence of each ID
                  const seenIds = new Set<string>();
                  const deduplicatedBlocks = updatedBlocks.filter((block) => {
                    if (seenIds.has(block.id)) {
                      return false;
                    }
                    seenIds.add(block.id);
                    return true;
                  });

                  updateBlocks(deduplicatedBlocks);
                } else {
                  updateBlocks(updatedBlocks);
                }

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
    console.log("Deleting block:", id);
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
    console.log("Block to delete:", blockToDelete);

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

    updateBlocks(reorderedBlocks);

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }

    // Delete from database if we have an emailId and the block exists in the database
    if (emailId && blockToDelete) {
      if (!isNaN(parseInt(blockToDelete.id, 10))) {
        // It's a numeric ID, delete directly
        const blockId = parseInt(blockToDelete.id, 10);
        console.log("Deleting block from database:", blockId);
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
        console.log("Block has UUID, checking if it exists in database");

        // Try to find a matching block in the database by comparing properties
        const matchingDbBlock = emailData.blocks.find((dbBlock) => {
          // Match by type and order
          return (
            dbBlock.type === blockToDelete.type &&
            dbBlock.order === blockToDelete.order
          );
        });

        if (matchingDbBlock) {
          console.log(
            "Found matching database block to delete:",
            matchingDbBlock.id
          );

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
          console.log(
            "No matching database block found, no need to delete from database"
          );

          // Remove from the set of blocks being deleted since there's no database operation
          setBlocksBeingDeleted((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockToDelete.id);
            return newSet;
          });
        }
      }
    } else {
      console.log("Not deleting block from database:", {
        emailId,
        blockId: id,
        blockExists: !!blockToDelete,
        isNumeric: blockToDelete
          ? !isNaN(parseInt(blockToDelete.id, 10))
          : false,
      });

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
      Object.values(editors).forEach((editor) => {
        if (editor && !editor.isDestroyed) {
          editor.destroy();
        }
      });
      // Clear the permanently deleted blocks ref when component unmounts
      permanentlyDeletedBlocksRef.current.clear();
    };
  }, [editors]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleBlockUpdate = (
    updatedBlock: BlockType,
    addToHistory: boolean = true
  ) => {
    console.log(
      "Updating block:",
      updatedBlock,
      "Add to history:",
      addToHistory
    );

    // First update the UI optimistically
    const newBlocks = blocks.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );

    // Ensure block order is maintained
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    // Update the UI with or without adding to history based on the parameter
    if (addToHistory) {
      updateBlocks(sortedBlocks);
    } else {
      updateBlocksWithoutHistory(sortedBlocks);
    }

    // Update in database if we have an emailId
    if (emailId) {
      // Check if the block ID is a number (from database) or a UUID (newly created)
      if (!isNaN(parseInt(updatedBlock.id, 10))) {
        // It's a numeric ID, update directly
        const dbBlockId = parseInt(updatedBlock.id, 10);
        console.log("Updating block in database:", {
          blockId: dbBlockId,
          type: updatedBlock.type,
          value: updatedBlock.data,
        });
        updateEmailBlock.mutate({
          blockId: dbBlockId,
          value: updatedBlock.data,
          type: updatedBlock.type,
        });
      } else {
        // It's a UUID, we need to find the corresponding database ID
        console.log("Block has UUID, checking if it exists in database");

        // If this is a newly created block that hasn't been saved to the database yet,
        // we need to save it first
        if (emailData && emailData.blocks) {
          // Try to find a matching block in the database by comparing properties
          // First try to match by type and order
          let matchingDbBlock = emailData.blocks.find(
            (dbBlock) =>
              dbBlock.type === updatedBlock.type &&
              dbBlock.order === updatedBlock.order
          );

          // If no match found, try to match by content similarity
          if (!matchingDbBlock && updatedBlock.data) {
            matchingDbBlock = emailData.blocks.find((dbBlock) => {
              if (dbBlock.type !== updatedBlock.type) return false;

              // For text blocks, compare content
              if (
                updatedBlock.type === "text" &&
                dbBlock.value &&
                updatedBlock.data
              ) {
                const dbValue = dbBlock.value as any;
                const blockData = updatedBlock.data as any;
                return dbValue.content === blockData.content;
              }

              // For author blocks, compare name and subtitle
              if (
                updatedBlock.type === "author" &&
                dbBlock.value &&
                updatedBlock.data
              ) {
                const dbValue = dbBlock.value as any;
                const blockData = updatedBlock.data as any;
                return (
                  dbValue.name === blockData.name &&
                  dbValue.subtitle === blockData.subtitle
                );
              }

              return false;
            });
          }

          if (matchingDbBlock) {
            console.log("Found matching database block:", matchingDbBlock.id);
            updateEmailBlock.mutate({
              blockId: matchingDbBlock.id,
              value: updatedBlock.data,
              type: updatedBlock.type,
            });

            // Update the block ID in our local state to use the database ID
            // but keep the same block in the UI
            const updatedBlocks = sortedBlocks.map((block) =>
              block.id === updatedBlock.id
                ? { ...block, id: matchingDbBlock.id.toString() }
                : block
            );

            // Check for duplicate IDs
            const updatedIds = updatedBlocks.map((block) => block.id);
            const hasDuplicates = updatedIds.some(
              (id, index) => updatedIds.indexOf(id) !== index
            );

            if (hasDuplicates) {
              console.log(
                "Found duplicate IDs after update, removing duplicates"
              );

              // Keep only the first occurrence of each ID
              const seenIds = new Set<string>();
              const deduplicatedBlocks = updatedBlocks.filter((block) => {
                if (seenIds.has(block.id)) {
                  return false;
                }
                seenIds.add(block.id);
                return true;
              });

              updateBlocks(deduplicatedBlocks);
            } else {
              updateBlocks(updatedBlocks);
            }
          } else {
            // No matching block found, add it to the database
            console.log("No matching database block found, adding to database");

            // Keep the block in the UI with its current UUID
            addEmailBlock.mutate(
              {
                emailId,
                type: updatedBlock.type,
                value: updatedBlock.data || ({} as BlockData),
                order: updatedBlock.order,
                linkedFile: undefined,
              },
              {
                onSuccess: (result) => {
                  if (result && result.id) {
                    console.log("Block added to database with ID:", result.id);
                    // Update the block ID in our local state but keep the same block in the UI
                    const updatedBlocks = sortedBlocks.map((block) =>
                      block.id === updatedBlock.id
                        ? { ...block, id: result.id.toString() }
                        : block
                    );

                    // Check for duplicate IDs
                    const updatedIds = updatedBlocks.map((block) => block.id);
                    const hasDuplicates = updatedIds.some(
                      (id, index) => updatedIds.indexOf(id) !== index
                    );

                    if (hasDuplicates) {
                      console.log(
                        "Found duplicate IDs after adding, removing duplicates"
                      );

                      // Keep only the first occurrence of each ID
                      const seenIds = new Set<string>();
                      const deduplicatedBlocks = updatedBlocks.filter(
                        (block) => {
                          if (seenIds.has(block.id)) {
                            return false;
                          }
                          seenIds.add(block.id);
                          return true;
                        }
                      );

                      updateBlocks(deduplicatedBlocks);
                    } else {
                      updateBlocks(updatedBlocks);
                    }
                  }
                },
              }
            );
          }
        }
      }
    } else {
      console.log("Not updating block in database:", {
        emailId,
        blockId: updatedBlock.id,
        isNumeric: !isNaN(parseInt(updatedBlock.id, 10)),
      });
    }
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

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!emailId) return;

    try {
      // 1. Update email styles
      await updateEmailStyle.mutateAsync({
        emailId,
        updates: {
          bg_color: bgColor,
          footer_bg_color: footerBgColor,
          footer_text_color: footerTextColor,
          footer_font: footerFont,
        },
      });

      // 2. First, add any blocks with UUID IDs to the database
      const blocksWithUUID = blocks.filter(
        (block) =>
          isNaN(parseInt(block.id, 10)) && isValidDatabaseBlockType(block.type)
      );

      console.log("Blocks with UUID to add:", blocksWithUUID);

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

          console.log("Added block to database:", result);

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
        updateBlocks(currentBlocks);
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

      console.log("Order updates:", orderUpdates);

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

      console.log("Content updates:", contentUpdates);
      console.log(
        "Author blocks:",
        currentBlocks.filter((block) => block.type === "author")
      );

      // 4. Send batch updates if there are any
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        await batchUpdateEmailBlocks.mutateAsync({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Show success message
      console.log("Email saved successfully");

      // Refresh the email data to get the latest block IDs
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });
    } catch (error) {
      console.error("Error saving email:", error);
    }
  }, [
    emailId,
    updateEmailStyle,
    batchUpdateEmailBlocks,
    addEmailBlock,
    bgColor,
    footerBgColor,
    footerTextColor,
    footerFont,
    blocks,
    queryClient,
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
    if (type === "author") {
      console.log("Author block validation:", { type, isValid });
    }
    return isValid;
  };

  // Handle undo with database sync
  const handleUndo = useCallback(async () => {
    if (!canUndo || !emailId) return;

    // Clear the blocksBeingDeleted set since we're undoing
    setBlocksBeingDeleted(new Set());

    // Also clear permanently deleted blocks when undoing
    permanentlyDeletedBlocksRef.current.clear();

    const { previousState, currentState } = undo();

    // Sync changes to database
    try {
      // 1. Identify blocks that were deleted (exist in currentState but not in previousState)
      const deletedBlocks = currentState.filter(
        (currentBlock) =>
          !previousState.some((prevBlock) => prevBlock.id === currentBlock.id)
      );

      // Delete blocks from database
      for (const block of deletedBlocks) {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          await deleteEmailBlock.mutateAsync({ blockId });
        }
      }

      // 2. Identify blocks that were added (exist in previousState but not in currentState)
      const addedBlocks = previousState.filter(
        (prevBlock) =>
          !currentState.some((currentBlock) => currentBlock.id === prevBlock.id)
      );

      // Add blocks to database
      for (const block of addedBlocks) {
        // Only add blocks that don't have a numeric ID (they're not in the database yet)
        if (isNaN(parseInt(block.id, 10))) {
          await addEmailBlock.mutateAsync({
            emailId,
            type: block.type,
            value: block.data || ({} as BlockData),
            order: block.order,
            linkedFile: undefined,
          });
        }
      }

      // 3. Prepare batch updates for blocks that exist in both states but have changed
      const orderUpdates: OrderUpdate[] = [];
      const contentUpdates: ContentUpdate[] = [];

      // Calculate order for all blocks in previousState
      previousState.forEach((block, index) => {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          // Always update order to match the current index in the array
          orderUpdates.push({
            id: blockId,
            order: index,
          });

          // Find the corresponding block in currentState
          const currentBlock = currentState.find(
            (current) => current.id === block.id
          );

          // If content or type changed, add to contentUpdates
          if (
            currentBlock &&
            (JSON.stringify(block.data) !== JSON.stringify(currentBlock.data) ||
              block.type !== currentBlock.type)
          ) {
            // Only add if the block type is compatible with DatabaseBlockType
            if (isValidDatabaseBlockType(block.type)) {
              contentUpdates.push({
                id: blockId,
                type: block.type as DatabaseBlockType,
                value: block.data,
              });
            }
          }
        }
      });

      // Send batch updates if there are any
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        await batchUpdateEmailBlocks.mutateAsync({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }
    } catch (error) {
      console.error("Error syncing undo changes to database:", error);
    }
  }, [
    undo,
    canUndo,
    emailId,
    deleteEmailBlock,
    addEmailBlock,
    batchUpdateEmailBlocks,
    setBlocksBeingDeleted,
  ]);

  // Handle redo with database sync
  const handleRedo = useCallback(async () => {
    if (!canRedo || !emailId) return;

    // Clear the blocksBeingDeleted set since we're redoing
    setBlocksBeingDeleted(new Set());

    // Also clear permanently deleted blocks when redoing
    permanentlyDeletedBlocksRef.current.clear();

    const { nextState, currentState } = redo();

    // Sync changes to database
    try {
      // 1. Identify blocks that were deleted (exist in currentState but not in nextState)
      const deletedBlocks = currentState.filter(
        (currentBlock) =>
          !nextState.some((nextBlock) => nextBlock.id === currentBlock.id)
      );

      // Delete blocks from database
      for (const block of deletedBlocks) {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          await deleteEmailBlock.mutateAsync({ blockId });
        }
      }

      // 2. Identify blocks that were added (exist in nextState but not in currentState)
      const addedBlocks = nextState.filter(
        (nextBlock) =>
          !currentState.some((currentBlock) => currentBlock.id === nextBlock.id)
      );

      // Add blocks to database
      for (const block of addedBlocks) {
        // Only add blocks that don't have a numeric ID (they're not in the database yet)
        if (isNaN(parseInt(block.id, 10))) {
          await addEmailBlock.mutateAsync({
            emailId,
            type: block.type,
            value: block.data || ({} as BlockData),
            order: block.order,
            linkedFile: undefined,
          });
        }
      }

      // 3. Prepare batch updates for blocks that exist in both states but have changed
      const orderUpdates: OrderUpdate[] = [];
      const contentUpdates: ContentUpdate[] = [];

      // Calculate order for all blocks in nextState
      nextState.forEach((block, index) => {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          // Always update order to match the current index in the array
          orderUpdates.push({
            id: blockId,
            order: index,
          });

          // Find the corresponding block in currentState
          const currentBlock = currentState.find(
            (current) => current.id === block.id
          );

          // If content or type changed, add to contentUpdates
          if (
            currentBlock &&
            (JSON.stringify(block.data) !== JSON.stringify(currentBlock.data) ||
              block.type !== currentBlock.type)
          ) {
            // Only add if the block type is compatible with DatabaseBlockType
            if (isValidDatabaseBlockType(block.type)) {
              contentUpdates.push({
                id: blockId,
                type: block.type as DatabaseBlockType,
                value: block.data,
              });
            }
          }
        }
      });

      // Send batch updates if there are any
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        await batchUpdateEmailBlocks.mutateAsync({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }
    } catch (error) {
      console.error("Error syncing redo changes to database:", error);
    }
  }, [
    redo,
    canRedo,
    emailId,
    deleteEmailBlock,
    addEmailBlock,
    batchUpdateEmailBlocks,
    setBlocksBeingDeleted,
  ]);

  // Function to ensure all database blocks are visible in the UI
  const ensureBlocksVisibility = useCallback(() => {
    if (!emailData || !emailData.blocks || !blocks) return;

    console.log("Ensuring blocks visibility");

    const uiBlockIds = blocks.map((block) => {
      // Convert numeric string IDs to numbers for comparison
      return !isNaN(parseInt(block.id, 10)) ? parseInt(block.id, 10) : block.id;
    });

    // Check for duplicate blocks in UI
    const duplicateIds = uiBlockIds.filter(
      (id, index) => uiBlockIds.indexOf(id) !== index
    );

    if (duplicateIds.length > 0) {
      console.log("Found duplicate blocks in UI:", duplicateIds);

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
        console.log(
          `Removed ${blocks.length - deduplicatedBlocks.length} duplicate blocks`
        );

        // Sort blocks by order
        const sortedBlocks = [...deduplicatedBlocks].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        updateBlocks(sortedBlocks);
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
      console.log(
        "Found blocks in database that are missing from UI:",
        missingBlocks
      );

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

      updateBlocks(sortedBlocks);
    }
  }, [emailData, blocks, updateBlocks, blocksBeingDeleted]);

  // Call ensureBlocksVisibility when emailData changes
  useEffect(() => {
    if (emailData) {
      // Only ensure visibility if we're not in the middle of deleting blocks
      if (blocksBeingDeleted.size === 0) {
        ensureBlocksVisibility();
      } else {
        console.log(
          "Skipping ensureBlocksVisibility because blocks are being deleted"
        );
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
        } else {
          console.log(
            "Skipping ensureBlocksVisibility because blocks are being deleted"
          );
        }
      }
    }, 1000); // Longer delay to allow server operations to complete

    return () => clearTimeout(timer);
  }, [blocks, ensureBlocksVisibility, emailData, blocksBeingDeleted]);

  // Filter out blocks that are being deleted from the UI
  useEffect(() => {
    if (blocksBeingDeleted.size > 0) {
      // Filter out blocks that are being deleted
      const filteredBlocks = blocks.filter((block) => {
        const isBeingDeleted = blocksBeingDeleted.has(block.id);

        // Also check numeric version if it's a numeric ID
        const isNumericIdBeingDeleted =
          !isNaN(parseInt(block.id, 10)) &&
          blocksBeingDeleted.has(parseInt(block.id, 10).toString());

        return !isBeingDeleted && !isNumericIdBeingDeleted;
      });

      // Only update if blocks were actually removed
      if (filteredBlocks.length < blocks.length) {
        console.log(
          `Filtering out ${blocks.length - filteredBlocks.length} blocks that are being deleted`
        );
        updateBlocksWithoutHistory(filteredBlocks);
      }
    }
  }, [blocksBeingDeleted, blocks, updateBlocksWithoutHistory]);

  // Clear blocksBeingDeleted after a timeout to prevent blocks from being permanently excluded
  useEffect(() => {
    if (blocksBeingDeleted.size > 0) {
      const timer = setTimeout(() => {
        console.log("Clearing blocksBeingDeleted after timeout");
        setBlocksBeingDeleted(new Set());
      }, 5000); // Clear after 5 seconds to ensure server operations have completed

      return () => clearTimeout(timer);
    }
  }, [blocksBeingDeleted]);

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
          <Button variant="outline">Preview</Button>
          <Button variant="outline">Send Test</Button>
          <Button variant="default" onClick={handleSave}>
            Save
          </Button>
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
            onBgColorChange={handleBgColorChange}
            bgColor={bgColor}
            onFooterBgColorChange={handleFooterBgColorChange}
            footerBgColor={footerBgColor}
            onFooterTextColorChange={handleFooterTextColorChange}
            footerTextColor={footerTextColor}
            onFooterFontChange={handleFooterFontChange}
            footerFont={footerFont}
            selectedBlock={
              selectedBlockId
                ? blocks.find((block) => block.id === selectedBlockId) || null
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
