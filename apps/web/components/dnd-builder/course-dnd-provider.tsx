"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";
import type { BlockData, Block as BlockType } from "@/types/blocks";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { LoaderIcon, Redo, Undo } from "@church-space/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import {
  CollisionDetection,
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
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Eye, SaveIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import Block from "./block";
import DndBuilderCanvas from "./canvas";
import EmailPreview from "./email-preview";
import { useAddCourseBlock } from "./mutations/use-add-course-block";
import { useBatchUpdateCourseBlocks } from "./mutations/use-batch-update-course-blocks";
import { useDeleteCourseBlock } from "./mutations/use-delete-course-block";
import { useUpdateCourseBlock } from "./mutations/use-update-course-block";
import { createEditor } from "./rich-text-editor/editor";
import Toolbar from "./rich-text-editor/rich-text-format-bar";
import DndBuilderSidebar, { allBlockTypes } from "./sidebar";
import { EmailStyles, useBlockStateManager } from "./use-block-state-manager";
import EmailBuilderRealtimeListener from "@/components/listeners/email-builder/realtime-listener";
import { DatabaseBlockType, OrderUpdate, ContentUpdate } from "./dnd-types";
import { useCourseWithBlocks } from "@/hooks/use-course-with-blocks";

export default function CourseDndProvider({
  organizationId,
}: {
  organizationId: string;
}) {
  // Move all hooks to the top level
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const courseId = params.courseId
    ? parseInt(params.courseId as string, 10)
    : undefined;
  const { data: courseData } = useCourseWithBlocks(courseId);
  const addCourseBlock = useAddCourseBlock();
  const deleteCourseBlock = useDeleteCourseBlock();
  const updateCourseBlock = useUpdateCourseBlock();
  const batchUpdateCourseBlocks = useBatchUpdateCourseBlocks();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const [isSaving, setIsSaving] = useState(false);
  const [blocksBeingDeleted, setBlocksBeingDeleted] = useState<Set<string>>(
    new Set(),
  );
  const permanentlyDeletedBlocksRef = useRef<Set<string>>(new Set());
  const databaseUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editors, setEditors] = useState<Record<string, Editor>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<
    "default" | "block" | "email-templates" | "email-style" | "email-footer"
  >("default");
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});

  // Initialize blocks and styles
  const initialBlocks =
    (courseData?.blocks?.map((block) => ({
      id: block.id.toString(),
      type: block.type as BlockType["type"],
      order: block.order || 0,
      data: block.value as unknown as BlockData,
    })) as BlockType[]) || [];

  // Use type assertion to avoid TypeScript errors
  const course = courseData?.course as any;

  console.log(course);

  const initialStyles: EmailStyles = {
    bgColor: "#f4f4f5",
    isInset: false,
    emailBgColor: "#ffffff",
    linkColor: "#0000ff",
    defaultTextColor: "#000000",
    defaultFont: "Inter",
    isRounded: true,
    accentTextColor: "#666666",
  };

  const {
    blocks,
    updateBlocksHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setCurrentState,
  } = useBlockStateManager(initialBlocks);

  // Create refs to track the latest blocks and styles
  const blocksRef = useRef(blocks);

  // Update the refs whenever blocks or styles change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Helper function to update block orders in the database
  const updateBlockOrdersInDatabase = useCallback(
    (blocksToUpdate: BlockType[]) => {
      if (!courseId) return;

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
          (update): update is { id: number; order: number } => update !== null,
        );

      // Only update blocks that already exist in the database (have numeric IDs)
      if (orderUpdates.length > 0) {
        batchUpdateCourseBlocks.mutate({
          courseId,
          orderUpdates,
        });
      }
    },
    [courseId, batchUpdateCourseBlocks],
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
      updateCourseBlock.mutate({
        blockId,
        value,
      });
    }, 1000),
    [updateCourseBlock],
  );

  // Update handleTextContentChange to check the isUndoRedoOperation flag
  const handleTextContentChange = (blockId: string, content: string) => {
    // Skip updating history during undo/redo operations
    if (isUndoRedoOperation) return;

    // Immediately update the UI with the new content
    const newBlocks = blocks.map((block) => {
      if (block.id === blockId && block.type === "text") {
        return {
          ...block,
          data: {
            ...block.data,
            content,
            font: initialStyles.defaultFont,
            textColor: initialStyles.defaultTextColor,
          } as BlockType["data"],
          order: block.order, // Explicitly preserve the order
        } as BlockType;
      }
      return block;
    });

    // Ensure block order is maintained by sorting
    const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

    // Update the UI immediately - this will add to history
    updateBlocksHistory(sortedBlocks);

    // Update in database if we have an emailId and the block exists in the database
    if (courseId && !isNaN(parseInt(blockId, 10))) {
      const dbBlockId = parseInt(blockId, 10);
      const blockToUpdate = blocks.find((block) => block.id === blockId);
      const existingData = (blockToUpdate?.data as any) || {};

      // Debounce the database update
      debouncedDatabaseUpdate(dbBlockId, {
        ...existingData,
        content,
        font: initialStyles.defaultFont,
        textColor: initialStyles.defaultTextColor,
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
        // Store the current blocks before reordering for server updates

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
          (id, index) => updatedIds.indexOf(id) !== index,
        );

        if (hasDuplicates) {
          const seenIds = new Set<string>();
          const deduplicatedBlocks = reorderedBlocks.filter((block) => {
            if (seenIds.has(block.id)) return false;
            seenIds.add(block.id);
            return true;
          });

          // Update the UI with the new block order - this will add to history
          updateBlocksHistory(deduplicatedBlocks);
        } else {
          // Update the UI with the new block order - this will add to history
          updateBlocksHistory(reorderedBlocks);
        }

        // Update order in database for all affected blocks
        if (courseId) {
          updateBlockOrdersInDatabase(reorderedBlocks);
        }
      }
      return;
    }

    // Only proceed with new block creation if dropping over canvas or an existing block
    if (over.id !== "canvas" && !blocks.some((block) => block.id === over.id)) {
      return;
    }

    // Handle new blocks from sidebar
    const newBlockId = crypto.randomUUID();
    const blockType = active.data.current.type;
    let newBlocks;
    let newBlockOrder;

    // Create the block data based on the block type
    let blockData: BlockData;

    if (blockType === "text") {
      blockData = {
        content: "",
        font: initialStyles.defaultFont,
        textColor: initialStyles.defaultTextColor,
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
      blockData = { color: initialStyles.defaultTextColor, margin: 0 };
    } else if (blockType === "button") {
      blockData = {
        text: "Button",
        link: "",
        color: initialStyles.defaultTextColor,
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

        // For large blocks, use a more nuanced approach to determine insertion position
        // Calculate the relative position within the target block (0-1 range)
        const relativePosition = (mouseY - rect.top) / rect.height;

        // Use a threshold that adapts based on the active block's height
        // For taller blocks, we want to make it easier to insert above a block
        const activeHeight = active.rect.current.translated.height || 0;
        const heightRatio = Math.min(1, activeHeight / rect.height);

        // Adjust threshold based on height ratio - taller blocks get a higher threshold
        // This makes it easier to insert a tall block above a smaller one
        const threshold = 0.5 + heightRatio * 0.2;

        // Insert before or after the target block based on adjusted threshold
        newBlockOrder =
          relativePosition < threshold ? overIndex : overIndex + 1;
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
        initialStyles.defaultFont,
        initialStyles.defaultTextColor,
        true, // preserve existing styles
        initialStyles.accentTextColor,
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

    // Update the local state - this will add to history
    updateBlocksHistory(newBlocks);

    // Add the block to the database if we have an emailId
    if (courseId) {
      // First update the UI optimistically
      // Then add to database
      addCourseBlock.mutate(
        {
          courseId,
          type: blockType,
          value: blockData,
          order: newBlockOrder,
          linkedFile: undefined,
        },
        {
          onSuccess: (result) => {
            if (result && result.id) {
              // Update the block ID in our local state to use the database ID
              const updatedBlocks = newBlocks.map((block) =>
                block.id === newBlockId
                  ? { ...block, id: result.id.toString() }
                  : block,
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
                (id, index) => updatedBlockIds.indexOf(id) !== index,
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

                // Update the UI - this will add to history
                updateBlocksHistory(deduplicatedBlocks);
              } else {
                // Update the UI - this will add to history
                updateBlocksHistory(updatedBlocks);
              }

              // Set the newly created block as the selected block
              setSelectedBlockId(result.id.toString());

              // Update the order of all blocks in the database to match their position in the UI
              // This ensures blocks after the insertion point have their order properly updated
              updateBlockOrdersInDatabase(updatedBlocks);
            } else {
              console.error("Failed to add block to database - no ID returned");
            }
          },
          onError: (error) => {
            console.error("Error adding block to database:", error);
            // You could show an error toast here
          },
        },
      );
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
    if (!blockToDelete) return;

    // Add to the set of blocks being deleted
    setBlocksBeingDeleted((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      // If it's a numeric ID, also add the string version
      if (!isNaN(parseInt(blockToDelete.id, 10))) {
        newSet.add(parseInt(blockToDelete.id, 10).toString());
      }
      return newSet;
    });

    // Also add to permanently deleted blocks
    // These will be removed from this set if the block is restored through undo/redo
    // and will be recreated on the server
    permanentlyDeletedBlocksRef.current.add(blockToDelete.id);
    if (!isNaN(parseInt(blockToDelete.id, 10))) {
      permanentlyDeletedBlocksRef.current.add(
        parseInt(blockToDelete.id, 10).toString(),
      );
    }

    // Update local state
    const updatedBlocks = blocks.filter((block) => block.id !== id);

    // Recalculate order for all blocks
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    // Update the UI - this will add to history
    updateBlocksHistory(reorderedBlocks);

    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }

    // Delete from database if we have an emailId and the block exists in the database
    if (courseId && blockToDelete) {
      if (!isNaN(parseInt(blockToDelete.id, 10))) {
        // It's a numeric ID, delete directly
        const blockId = parseInt(blockToDelete.id, 10);
        deleteCourseBlock.mutate(
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
              if (courseId) {
                queryClient.invalidateQueries({
                  queryKey: ["course", courseId],
                });
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
          },
        );
      } else if (courseData && courseData.blocks) {
        // It's a UUID, we need to find the corresponding database ID

        // Try to find a matching block in the database by comparing properties
        const matchingDbBlock = courseData.blocks.find((dbBlock) => {
          // Match by type and order
          return (
            dbBlock.type === blockToDelete.type &&
            dbBlock.order === blockToDelete.order
          );
        });

        if (matchingDbBlock) {
          // Add the matching DB block ID to permanently deleted blocks
          permanentlyDeletedBlocksRef.current.add(
            matchingDbBlock.id.toString(),
          );

          deleteCourseBlock.mutate(
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
                if (courseId) {
                  queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
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
            },
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
    (updatedBlock: BlockType, isDuplication: boolean = false) => {
      // For duplications, we need to add the block to the list instead of updating an existing one
      if (isDuplication) {
        // Find the original block to determine where to insert the duplicated block
        const originalBlock = blocks.find(
          (block) => block.id === updatedBlock.duplicatedFromId,
        );

        let insertIndex = blocks.length; // Default to end of list
        if (originalBlock) {
          // Insert after the original block
          insertIndex = originalBlock.order + 1;
        }

        // Create a new array with all blocks
        let newBlocks = [...blocks];

        // Set the correct order for the duplicated block
        updatedBlock = {
          ...updatedBlock,
          order: insertIndex,
        };

        // Insert the duplicated block at the correct position
        newBlocks.splice(insertIndex, 0, updatedBlock);

        // Update the order of all blocks after the insertion point
        newBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        // Update the UI immediately - this will add to history
        updateBlocksHistory(newBlocks);

        // Add the duplicated block to the database if we have an emailId
        if (courseId) {
          // Create a default value if data is undefined based on block type
          let blockValue: BlockData;
          if (!updatedBlock.data) {
            // Create a minimal default value based on block type
            switch (updatedBlock.type) {
              case "text":
                blockValue = { content: "" };
                break;
              case "button":
                blockValue = {
                  text: "Button",
                  link: "#",
                  color: "#000000",
                  textColor: "#ffffff",
                  style: "filled",
                  size: "fit",
                  centered: true,
                };
                break;
              case "divider":
                blockValue = { color: "#000000", margin: 20 };
                break;
              case "image":
                blockValue = {
                  image: "",
                  size: 100,
                  link: "",
                  centered: true,
                };
                break;
              case "video":
                blockValue = {
                  url: "",
                  size: 100,
                  centered: true,
                };
                break;
              case "file-download":
                blockValue = {
                  title: "Download",
                  file: "",
                  bgColor: "#f5f5f5",
                  textColor: "#000000",
                };
                break;
              case "cards":
                blockValue = {
                  title: "",
                  subtitle: "",
                  textColor: "#000000",
                  labelColor: "#666666",
                  buttonColor: "#000000",
                  buttonTextColor: "#ffffff",
                  cards: [],
                };
                break;
              case "list":
                blockValue = {
                  title: "",
                  subtitle: "",
                  textColor: "#000000",
                  bulletColor: "#000000",
                  bulletType: "bullet",
                  items: [],
                };
                break;
              case "author":
                blockValue = {
                  name: "",
                  subtitle: "",
                  avatar: "",
                  textColor: "#000000",
                  links: [],
                };
                break;
              default:
                // This should never happen as we're duplicating an existing block
                blockValue = { content: "" } as BlockData;
            }
          } else {
            blockValue = updatedBlock.data;
          }

          addCourseBlock.mutate(
            {
              courseId,
              type: updatedBlock.type,
              value: blockValue,
              order: insertIndex,
              linkedFile: undefined,
            },
            {
              onSuccess: (result) => {
                if (result && result.id) {
                  // Update the block ID in our local state to use the database ID
                  const updatedBlocks = newBlocks.map((block) =>
                    block.id === updatedBlock.id
                      ? { ...block, id: result.id.toString() }
                      : block,
                  );

                  // Update the editor reference if this is a text block
                  if (updatedBlock.type === "text") {
                    setEditors((prev) => {
                      const newEditors = { ...prev };
                      if (newEditors[updatedBlock.id]) {
                        // Move the editor reference to the new ID
                        newEditors[result.id.toString()] =
                          newEditors[updatedBlock.id];
                        delete newEditors[updatedBlock.id];
                      }
                      return newEditors;
                    });
                  }

                  // Check for duplicate IDs
                  const updatedBlockIds = updatedBlocks.map(
                    (block) => block.id,
                  );
                  const hasBlockDuplicates = updatedBlockIds.some(
                    (id, index) => updatedBlockIds.indexOf(id) !== index,
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

                    // Update the UI - this will add to history
                    updateBlocksHistory(deduplicatedBlocks);
                  } else {
                    // Update the UI - this will add to history
                    updateBlocksHistory(updatedBlocks);
                  }

                  // Set the newly created block as the selected block
                  setSelectedBlockId(result.id.toString());

                  // Update the order of all blocks in the database to match their position in the UI
                  // This ensures blocks after the insertion point have their order properly updated
                  updateBlockOrdersInDatabase(updatedBlocks);
                } else {
                  console.error(
                    "Failed to add block to database - no ID returned",
                  );
                }
              },
              onError: (error) => {
                console.error("Error adding block to database:", error);
                // You could show an error toast here
              },
            },
          );
        }

        return;
      }

      // Regular update operation (non-duplication)
      const existingBlock = blocks.find(
        (block) => block.id === updatedBlock.id,
      );
      if (existingBlock) {
        updatedBlock = {
          ...updatedBlock,
          order: existingBlock.order, // Preserve the existing order
        };
      }
      const newBlocks = blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block,
      );

      // Ensure block order is maintained by explicitly sorting
      const sortedBlocks = [...newBlocks].sort((a, b) => a.order - b.order);

      // Always update UI immediately - this will add to history
      updateBlocksHistory(sortedBlocks);

      // For database updates, debounce the operation
      if (courseId) {
        if (databaseUpdateTimerRef.current) {
          clearTimeout(databaseUpdateTimerRef.current);
        }

        databaseUpdateTimerRef.current = setTimeout(() => {
          if (!isNaN(parseInt(updatedBlock.id, 10))) {
            // Update existing block - include the order in the update
            const dbBlockId = parseInt(updatedBlock.id, 10);
            updateCourseBlock.mutate({
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
      courseId,
      blocks,
      updateBlocksHistory,
      updateCourseBlock,
      addCourseBlock,
      setSelectedBlockId,
      updateBlockOrdersInDatabase,
    ],
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
          <div className="flex cursor-grab flex-col items-center gap-1 rounded-md border bg-accent p-3 opacity-80 shadow-sm">
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
          initialStyles.defaultFont,
          initialStyles.defaultTextColor,
          true, // preserve existing styles
          initialStyles.accentTextColor,
        );

        return (
          <Block
            id={draggedBlock.id}
            type={draggedBlock.type}
            isDragging={true}
            editor={overlayEditor}
            isOverlay
            block={draggedBlock}
            defaultFont={initialStyles.defaultFont}
            defaultTextColor={initialStyles.defaultTextColor}
            isRounded={initialStyles.isRounded}
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
          defaultFont={initialStyles.defaultFont}
          defaultTextColor={initialStyles.defaultTextColor}
          isRounded={initialStyles.isRounded}
        />
      );
    }

    return null;
  };

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!courseId) return;

    // Set saving state to true
    setIsSaving(true);

    try {
      // 2. First, add any blocks with UUID IDs to the database
      const blocksWithUUID = blocks.filter(
        (block) =>
          isNaN(parseInt(block.id, 10)) && isValidDatabaseBlockType(block.type),
      );

      // Keep track of the updated blocks
      let currentBlocks = [...blocks];

      // Add each block to the database
      for (const block of blocksWithUUID) {
        try {
          // Keep the block in the UI with its current UUID
          const result = await addCourseBlock.mutateAsync({
            courseId,
            type: block.type,
            value: block.data || ({} as BlockData),
            order: block.order,
            linkedFile: undefined,
          });

          // Update the block ID in our local state but keep the same block in the UI
          if (result && result.id) {
            currentBlocks = currentBlocks.map((b) =>
              b.id === block.id ? { ...b, id: result.id.toString() } : b,
            );
          }
        } catch (error) {
          console.error("Error adding block to database:", error);
        }
      }

      // Update blocks with new IDs but keep the same UI
      if (JSON.stringify(currentBlocks) !== JSON.stringify(blocks)) {
        updateBlocksHistory(currentBlocks);
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
            isValidDatabaseBlockType(block.type),
        )
        .map((block) => ({
          id: parseInt(block.id, 10),
          type: block.type as DatabaseBlockType,
          value: block.data,
        }));

      // 4. Send batch updates if there are any
      if (orderUpdates.length > 0 || contentUpdates.length > 0) {
        await batchUpdateCourseBlocks.mutateAsync({
          courseId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Refresh the course data to get the latest block IDs
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });

      // Navigate to the emails page with the emailId
      router.push(`/courses/${courseId}`);

      // Note: We don't set isSaving to false here because we want the button
      // to remain in loading state during navigation
    } catch (error) {
      console.error("Error saving course:", error);
      // Set saving state to false if there's an error
      setIsSaving(false);
    }
  }, [
    courseId,
    batchUpdateCourseBlocks,
    addCourseBlock,
    blocks,
    queryClient,
    router,
  ]);

  // Helper function to check if a block type is valid for the database
  const isValidDatabaseBlockType = (
    type: string,
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

  // Function to ensure all database blocks are visible in the UI
  const ensureBlocksVisibility = useCallback(() => {
    if (!courseData || !courseData.blocks || !blocks) return;

    const uiBlockIds = blocks.map((block) => {
      // Convert numeric string IDs to numbers for comparison
      return !isNaN(parseInt(block.id, 10)) ? parseInt(block.id, 10) : block.id;
    });

    // Check for duplicate blocks in UI
    const duplicateIds = uiBlockIds.filter(
      (id, index) => uiBlockIds.indexOf(id) !== index,
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
          (a, b) => (a.order || 0) - (b.order || 0),
        );

        updateBlocksHistory(sortedBlocks);
        return; // Exit early since we've updated the blocks
      }
    }

    // Check for missing blocks (in DB but not in UI)
    const missingBlocks = courseData.blocks.filter((dbBlock) => {
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
        (a, b) => (a.order || 0) - (b.order || 0),
      );

      updateBlocksHistory(sortedBlocks);
    }
  }, [courseData, blocks, updateBlocksHistory, blocksBeingDeleted]);

  // Call ensureBlocksVisibility when courseData changes
  useEffect(() => {
    if (courseData) {
      // Only ensure visibility if we're not in the middle of deleting blocks
      if (blocksBeingDeleted.size === 0) {
        ensureBlocksVisibility();
      }
    }
  }, [courseData, ensureBlocksVisibility, blocksBeingDeleted]);

  // Also call ensureBlocksVisibility after blocks are updated
  useEffect(() => {
    // Use a longer delay to allow server operations to complete
    const timer = setTimeout(() => {
      if (courseData && blocks) {
        // Only ensure visibility if we're not in the middle of deleting blocks
        if (blocksBeingDeleted.size === 0) {
          ensureBlocksVisibility();
        }
      }
    }, 1000); // Longer delay to allow server operations to complete

    return () => clearTimeout(timer);
  }, [blocks, ensureBlocksVisibility, courseData, blocksBeingDeleted]);

  // Filter out blocks that are being deleted from the UI
  const filteredBlocks = blocks.filter((block) => {
    const isBeingDeleted = blocksBeingDeleted.has(block.id);
    const isNumericIdBeingDeleted =
      !isNaN(parseInt(block.id, 10)) &&
      blocksBeingDeleted.has(parseInt(block.id, 10).toString());
    const isPermanentlyDeleted =
      permanentlyDeletedBlocksRef.current.has(block.id) ||
      (!isNaN(parseInt(block.id, 10)) &&
        permanentlyDeletedBlocksRef.current.has(
          parseInt(block.id, 10).toString(),
        ));

    return !isBeingDeleted && !isNumericIdBeingDeleted && !isPermanentlyDeleted;
  });

  // Only update if blocks were actually removed
  if (filteredBlocks.length < blocks.length) {
    updateBlocksHistory(filteredBlocks);
  }

  // Clear blocksBeingDeleted after a timeout to prevent blocks from being permanently excluded
  useEffect(() => {
    if (blocksBeingDeleted.size > 0) {
      const timer = setTimeout(() => {
        // Only clear IDs that aren't in permanentlyDeletedBlocksRef
        setBlocksBeingDeleted((prev) => {
          const newSet = new Set<string>();
          prev.forEach((id) => {
            // Only keep IDs that are in permanentlyDeletedBlocksRef
            if (permanentlyDeletedBlocksRef.current.has(id)) {
              newSet.add(id);
            }
          });
          return newSet;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [blocksBeingDeleted]);

  // Initialize editors for text blocks
  useEffect(() => {
    const missingEditors = blocks.filter(
      (block) => block.type === "text" && !editors[block.id],
    );

    if (missingEditors.length > 0) {
      const newEditors = { ...editors };
      missingEditors.forEach((block) => {
        // Create a new editor with the block's content
        const initialContent =
          block.data && (block.data as any).content
            ? (block.data as any).content
            : "";

        // Always use the default font and color from course settings
        const newEditor = createEditor(
          initialContent,
          initialStyles.defaultFont,
          initialStyles.defaultTextColor,
          true, // preserve existing styles
          initialStyles.accentTextColor,
        );
        newEditors[block.id] = newEditor;
      });

      setEditors(newEditors);
    }
  }, [blocks, initialStyles.defaultFont, initialStyles.defaultTextColor]);

  // Custom collision detection that handles large blocks differently
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active, droppableContainers, droppableRects, pointerCoordinates } =
      args;

    // If no pointer coordinates, return empty result
    if (!pointerCoordinates) return [];

    // Get the canvas container
    const canvasContainer = droppableContainers.find(
      (container) => container.id === "canvas",
    );
    if (!canvasContainer) return [];

    // Get the canvas rect
    const canvasRect = droppableRects.get(canvasContainer.id);
    if (!canvasRect) return [];

    // Check if pointer is actually within the canvas bounds
    const isOverCanvas =
      pointerCoordinates.x >= canvasRect.left &&
      pointerCoordinates.x <= canvasRect.right &&
      pointerCoordinates.y >= canvasRect.top &&
      pointerCoordinates.y <= canvasRect.bottom;

    // If not over canvas, return no collisions
    if (!isOverCanvas) return [];

    // Filter containers to only those in the canvas
    const filtered = droppableContainers.filter((container) => {
      const rect = droppableRects.get(container.id);
      if (!rect) return false;

      return (
        container.id === "canvas" ||
        (blocks.some((block) => block.id === container.id) &&
          rect.left >= canvasRect.left &&
          rect.right <= canvasRect.right)
      );
    });

    // Get the active block's height (if it's an existing block)
    let activeBlockHeight = 0;
    if (!active.data.current?.fromSidebar) {
      const activeBlock = blocks.find((block) => block.id === active.id);
      if (activeBlock) {
        const activeRect = droppableRects.get(active.id);
        if (activeRect) {
          activeBlockHeight = activeRect.height;
        }
      }
    }

    // For each container, calculate its position relative to the pointer
    const positions = filtered.map((container) => {
      const rect = droppableRects.get(container.id);
      if (!rect) return { container, distance: Infinity, position: "none" };

      const pointerY = pointerCoordinates.y;

      // Calculate the extended target zones based on block height
      // For larger blocks, we need larger target zones
      const extensionFactor = Math.max(1, activeBlockHeight / 100); // Scale based on active block height
      const virtualZoneTop = rect.top - rect.height * 0.5 * extensionFactor;
      const virtualZoneBottom =
        rect.bottom + rect.height * 0.5 * extensionFactor;

      // Determine if pointer is above, within, or below the block
      let position = "none";
      let distance = Infinity;

      // If pointer is above the block but within the extended top zone
      if (pointerY >= virtualZoneTop && pointerY < rect.top) {
        position = "top";
        distance = Math.abs(pointerY - rect.top);
      }
      // If pointer is within the block
      else if (pointerY >= rect.top && pointerY <= rect.bottom) {
        position = "within";
        // For within, calculate distance to center
        const centerY = rect.top + rect.height / 2;
        distance = Math.abs(pointerY - centerY);
      }
      // If pointer is below the block but within the extended bottom zone
      else if (pointerY > rect.bottom && pointerY <= virtualZoneBottom) {
        position = "bottom";
        distance = Math.abs(pointerY - rect.bottom);
      }

      // Calculate horizontal distance component
      const centerX = rect.left + rect.width / 2;
      const horizontalDistance = Math.abs(pointerCoordinates.x - centerX);

      // Combine vertical and horizontal distances, with more weight on vertical
      const combinedDistance =
        position !== "none" ? distance * 3 + horizontalDistance : Infinity;

      return {
        container,
        distance: combinedDistance,
        position,
      };
    });

    // Sort by distance
    positions.sort((a, b) => a.distance - b.distance);

    // Return the closest container if it's within a reasonable distance
    const closest = positions[0];
    if (closest && closest.distance !== Infinity) {
      return [{ id: closest.container.id }];
    }

    // If no close blocks found but we're over the canvas, return canvas as target
    if (canvasContainer) {
      return [{ id: canvasContainer.id }];
    }

    return [];
  };

  // Create a debounced function for server updates during undo/redo
  const debouncedServerUpdate = useCallback(
    debounce((currentBlocks: BlockType[], previousBlocks: BlockType[]) => {
      if (!courseId) return;

      // 1. Find blocks that were in previousBlocks but not in currentBlocks (deleted blocks)
      const deletedBlocks = previousBlocks.filter(
        (prevBlock) =>
          !currentBlocks.some((currBlock) => currBlock.id === prevBlock.id),
      );

      // 2. Find blocks that are in currentBlocks but not in previousBlocks (new blocks or restored blocks)
      const newBlocks = currentBlocks.filter(
        (currBlock) =>
          !previousBlocks.some((prevBlock) => prevBlock.id === currBlock.id),
      );

      // 3. Find blocks that exist in both but have different content (updated blocks)
      const updatedBlocks = currentBlocks.filter((currBlock) => {
        const prevBlock = previousBlocks.find((pb) => pb.id === currBlock.id);
        if (!prevBlock) return false;

        // Check if the block has changed (excluding order changes which are handled separately)
        return (
          JSON.stringify(currBlock.data) !== JSON.stringify(prevBlock.data) ||
          currBlock.type !== prevBlock.type
        );
      });

      // 4. Process deleted blocks (if they have numeric IDs, delete from server)
      deletedBlocks.forEach((block) => {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          deleteCourseBlock.mutate({ blockId });
        }
      });

      // 5. Process new blocks
      newBlocks.forEach((block) => {
        // Check if the block has a numeric ID (could be a previously deleted block being restored)
        const hasNumericId = !isNaN(parseInt(block.id, 10));

        // Check if this block was previously deleted and is now being restored
        const wasDeleted =
          hasNumericId &&
          (permanentlyDeletedBlocksRef.current.has(block.id) ||
            permanentlyDeletedBlocksRef.current.has(
              parseInt(block.id, 10).toString(),
            ));

        // Only create blocks on the server if:
        // 1. They have a UUID (new blocks from sidebar)
        // 2. OR they were previously deleted and are being restored (have numeric IDs)
        if (!hasNumericId || wasDeleted) {
          // For blocks with UUID IDs, add them normally
          // For blocks with numeric IDs that were deleted, recreate them
          addCourseBlock.mutate(
            {
              courseId,
              type: block.type,
              value: block.data || ({} as BlockData),
              order: block.order,
              linkedFile: undefined,
            },
            {
              onSuccess: (result) => {
                // If the block was successfully created on the server, update the UI with the new ID
                if (result && result.id) {
                  // Only update the UI if the IDs are different
                  if (block.id !== result.id.toString()) {
                    // Find the current blocks
                    const currentUIBlocks = blocksRef.current;

                    // Update the block ID in our local state
                    const updatedBlocks = currentUIBlocks.map((b) =>
                      b.id === block.id
                        ? { ...b, id: result.id.toString() }
                        : b,
                    );

                    // Update the UI with the new ID - this will add to history
                    // We use a setTimeout to avoid conflicts with the current operation
                    setTimeout(() => {
                      updateBlocksHistory(updatedBlocks);
                    }, 0);
                  }
                }

                // Remove from permanently deleted blocks if it was there
                if (wasDeleted) {
                  permanentlyDeletedBlocksRef.current.delete(block.id);
                  if (hasNumericId) {
                    permanentlyDeletedBlocksRef.current.delete(
                      parseInt(block.id, 10).toString(),
                    );
                  }
                }

                // Invalidate the query to refresh the data
                queryClient.invalidateQueries({
                  queryKey: ["course", courseId],
                });
              },
            },
          );
        }
      });

      // 6. Process updated blocks (if they have numeric IDs, update on server)
      updatedBlocks.forEach((block) => {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          updateCourseBlock.mutate({
            blockId,
            type: block.type,
            value: block.data,
            order: block.order,
          });
        }
      });

      // 7. Update all block orders - this ensures all blocks have the correct order on the server
      // We need to do this after processing all blocks to ensure the order is consistent
      setTimeout(() => {
        // Get the latest blocks from the UI
        const latestBlocks = blocksRef.current;

        // Create order updates for all blocks with numeric IDs
        const orderUpdates = latestBlocks
          .map((block, index) => {
            if (!isNaN(parseInt(block.id, 10))) {
              return {
                id: parseInt(block.id, 10),
                order: index, // Use the index as the order to ensure consistent ordering
              };
            }
            return null;
          })
          .filter(
            (update): update is { id: number; order: number } =>
              update !== null,
          );

        if (orderUpdates.length > 0 && courseId) {
          batchUpdateCourseBlocks.mutate({
            courseId,
            orderUpdates,
          });
        }
      }, 1000); // Wait a bit to ensure all block creations have completed
    }, 500),
    [
      courseId,
      addCourseBlock,
      deleteCourseBlock,
      updateCourseBlock,
      batchUpdateCourseBlocks,
      queryClient,
      updateBlocksHistory,
    ],
  );

  // Handle undo button click
  const handleUndo = useCallback(() => {
    // Set flag to prevent recursive updates
    setIsUndoRedoOperation(true);

    // Store the current blocks before the undo operation
    const blocksBeforeUndo = [...blocks];

    // Perform the undo operation
    const previousState = undo();

    if (previousState) {
      // Find blocks that are being restored (in previousState but not in blocksBeforeUndo)
      const restoredBlocks = previousState.blocks.filter(
        (prevBlock) =>
          !blocksBeforeUndo.some((currBlock) => currBlock.id === prevBlock.id),
      );

      // Find blocks that are being removed (in blocksBeforeUndo but not in previousState)
      // These are likely duplicated blocks that are being undone
      const removedBlocks = blocksBeforeUndo.filter(
        (currBlock) =>
          !previousState.blocks.some(
            (prevBlock) => prevBlock.id === currBlock.id,
          ),
      );

      // Add removed blocks to blocksBeingDeleted to ensure they're filtered out of the UI
      if (removedBlocks.length > 0) {
        // Add to blocksBeingDeleted for immediate UI filtering
        setBlocksBeingDeleted((prev) => {
          const newSet = new Set(prev);
          removedBlocks.forEach((block) => {
            newSet.add(block.id);
            if (!isNaN(parseInt(block.id, 10))) {
              newSet.add(parseInt(block.id, 10).toString());
            }

            // Also add to permanentlyDeletedBlocksRef to ensure they don't reappear
            permanentlyDeletedBlocksRef.current.add(block.id);
            if (!isNaN(parseInt(block.id, 10))) {
              permanentlyDeletedBlocksRef.current.add(
                parseInt(block.id, 10).toString(),
              );
            }
          });
          return newSet;
        });

        // Immediately update the UI to remove these blocks
        // This ensures they don't jump to the bottom of the page
        const filteredCurrentBlocks = blocksBeforeUndo.filter(
          (block) => !removedBlocks.some((removed) => removed.id === block.id),
        );

        // Only update if blocks were actually removed
        if (filteredCurrentBlocks.length < blocksBeforeUndo.length) {
          // Force the UI to update with the filtered blocks
          setCurrentState({
            blocks: previousState.blocks,
            styles: previousState.styles,
            footer: previousState.footer,
          });
        }
      }

      // For each restored block, check if it has a numeric ID and mark it as deleted
      // so that it will be recreated on the server
      restoredBlocks.forEach((block) => {
        // If it has a numeric ID, mark it as deleted so it will be recreated
        if (!isNaN(parseInt(block.id, 10))) {
          permanentlyDeletedBlocksRef.current.add(block.id);
          permanentlyDeletedBlocksRef.current.add(
            parseInt(block.id, 10).toString(),
          );
        }
      });

      // Update server state based on the differences
      // This will recreate any restored blocks on the server
      debouncedServerUpdate(previousState.blocks, blocksBeforeUndo);

      // Update editor content for text blocks
      previousState.blocks.forEach((block) => {
        if (
          block.type === "text" &&
          editors[block.id] &&
          !editors[block.id].isDestroyed
        ) {
          const content = (block.data as any)?.content || "";

          // Only update if content has changed to avoid unnecessary re-renders
          if (editors[block.id].getHTML() !== content) {
            // Set content directly
            editors[block.id].commands.setContent(content);
          }
        }
      });

      // Handle blocks that exist in the current state but not in the previous state
      // (these editors need to be destroyed)
      blocksBeforeUndo.forEach((block) => {
        const stillExists = previousState.blocks.some((b) => b.id === block.id);
        if (
          !stillExists &&
          block.type === "text" &&
          editors[block.id] &&
          !editors[block.id].isDestroyed
        ) {
          // Clean up the editor
          try {
            editors[block.id].destroy();
          } catch (error) {
            console.error("Error destroying editor during undo:", error);
          }

          // Remove from editors state
          setEditors((prev) => {
            const newEditors = { ...prev };
            delete newEditors[block.id];
            return newEditors;
          });
        }
      });
    }

    // Reset flag after a short delay to allow updates to complete
    setTimeout(() => {
      setIsUndoRedoOperation(false);
    }, 100);
  }, [
    undo,
    blocks,
    debouncedServerUpdate,
    editors,
    setEditors,
    setBlocksBeingDeleted,
    setCurrentState,
  ]);

  // Handle redo button click
  const handleRedo = useCallback(() => {
    // Set flag to prevent recursive updates
    setIsUndoRedoOperation(true);

    // Store the current blocks before the redo operation
    const blocksBeforeRedo = [...blocks];

    // Perform the redo operation
    const nextState = redo();

    if (nextState) {
      // Find blocks that are being restored (in nextState but not in blocksBeforeRedo)
      const restoredBlocks = nextState.blocks.filter(
        (nextBlock) =>
          !blocksBeforeRedo.some((currBlock) => currBlock.id === nextBlock.id),
      );

      // Find blocks that are being removed (in blocksBeforeRedo but not in nextState)
      const removedBlocks = blocksBeforeRedo.filter(
        (currBlock) =>
          !nextState.blocks.some((nextBlock) => nextBlock.id === currBlock.id),
      );

      // Add removed blocks to blocksBeingDeleted to ensure they're filtered out of the UI
      if (removedBlocks.length > 0) {
        // Add to blocksBeingDeleted for immediate UI filtering
        setBlocksBeingDeleted((prev) => {
          const newSet = new Set(prev);
          removedBlocks.forEach((block) => {
            newSet.add(block.id);
            if (!isNaN(parseInt(block.id, 10))) {
              newSet.add(parseInt(block.id, 10).toString());
            }

            // Also add to permanentlyDeletedBlocksRef to ensure they don't reappear
            permanentlyDeletedBlocksRef.current.add(block.id);
            if (!isNaN(parseInt(block.id, 10))) {
              permanentlyDeletedBlocksRef.current.add(
                parseInt(block.id, 10).toString(),
              );
            }
          });
          return newSet;
        });

        // Immediately update the UI to remove these blocks
        // This ensures they don't jump to the bottom of the page
        const filteredCurrentBlocks = blocksBeforeRedo.filter(
          (block) => !removedBlocks.some((removed) => removed.id === block.id),
        );

        // Only update if blocks were actually removed
        if (filteredCurrentBlocks.length < blocksBeforeRedo.length) {
          // Force the UI to update with the filtered blocks
          setCurrentState({
            blocks: nextState.blocks,
            styles: nextState.styles,
            footer: nextState.footer,
          });
        }
      }

      // For each restored block, check if it has a numeric ID and mark it as deleted
      // so that it will be recreated on the server
      restoredBlocks.forEach((block) => {
        // If it has a numeric ID, mark it as deleted so it will be recreated
        if (!isNaN(parseInt(block.id, 10))) {
          permanentlyDeletedBlocksRef.current.add(block.id);
          permanentlyDeletedBlocksRef.current.add(
            parseInt(block.id, 10).toString(),
          );
        }
      });

      // Update server state based on the differences
      // This will recreate any restored blocks on the server
      debouncedServerUpdate(nextState.blocks, blocksBeforeRedo);

      // Update editor content for text blocks
      nextState.blocks.forEach((block) => {
        if (block.type === "text") {
          const content = (block.data as any)?.content || "";

          // Check if the editor exists
          if (editors[block.id] && !editors[block.id].isDestroyed) {
            // Only update if content has changed to avoid unnecessary re-renders
            if (editors[block.id].getHTML() !== content) {
              // Set content directly
              editors[block.id].commands.setContent(content);
            }
          } else {
            // Create a new editor for this block if it doesn't exist
            const newEditor = createEditor(
              content,
              initialStyles.defaultFont,
              initialStyles.defaultTextColor,
              true, // preserve existing styles
              initialStyles.accentTextColor,
            );

            // Add to editors state
            setEditors((prev) => ({
              ...prev,
              [block.id]: newEditor,
            }));
          }
        }
      });

      // Handle blocks that exist in the current state but not in the next state
      // (these editors need to be destroyed)
      blocksBeforeRedo.forEach((block) => {
        const stillExists = nextState.blocks.some((b) => b.id === block.id);
        if (
          !stillExists &&
          block.type === "text" &&
          editors[block.id] &&
          !editors[block.id].isDestroyed
        ) {
          // Clean up the editor
          try {
            editors[block.id].destroy();
          } catch (error) {
            console.error("Error destroying editor during redo:", error);
          }

          // Remove from editors state
          setEditors((prev) => {
            const newEditors = { ...prev };
            delete newEditors[block.id];
            return newEditors;
          });
        }
      });
    }

    // Reset flag after a short delay to allow updates to complete
    setTimeout(() => {
      setIsUndoRedoOperation(false);
    }, 100);
  }, [
    redo,
    blocks,
    debouncedServerUpdate,
    editors,
    setEditors,
    initialStyles.defaultFont,
    initialStyles.defaultTextColor,
    initialStyles.accentTextColor,
    setBlocksBeingDeleted,
    setCurrentState,
  ]);

  // UNDO REDO KEY COMMANDS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input or textarea to avoid capturing keystrokes during text editing
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          handleUndo();
        }
      }

      // Redo: Cmd+Y or Cmd+Shift+Z (Mac) or Ctrl+Y or Ctrl+Shift+Z (Windows)
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        if (canRedo()) {
          handleRedo();
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  // Extract canUndo and canRedo values for UI rendering
  const canUndoValue = canUndo();
  const canRedoValue = canRedo();

  // Update canUndo and canRedo values when blocks or styles change
  useEffect(() => {
    // Force a re-evaluation of canUndo and canRedo
    const newCanUndoValue = canUndo();
    const newCanRedoValue = canRedo();

    // Only update if values have changed to avoid unnecessary re-renders
    if (newCanUndoValue !== canUndoValue || newCanRedoValue !== canRedoValue) {
      // This will trigger a re-render with the updated values
      setIsUndoRedoOperation((prev) => !prev); // Toggle to force re-render
      setIsUndoRedoOperation((prev) => !prev); // Toggle back
    }
  }, [blocks, canUndo, canRedo, canUndoValue, canRedoValue]);

  return (
    <div className="relative flex h-full flex-col">
      <Dialog
        open={isMobile && showMobileWarning}
        onOpenChange={setShowMobileWarning}
      >
        <DialogContent className="max-w-[94%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Mobile Editing (Beta)</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              You are currently using the course editor on a mobile device.
              While we support mobile editing, it is still in beta and you may
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
      <header className="sticky left-0 right-0 top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails">Email</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/courses/${courseId}`}
                  className="truncate"
                >
                  {courseData?.course?.title || "Course Title"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
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
                  disabled={!canUndoValue}
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
                  disabled={!canRedoValue}
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
            <DialogContent className="h-[95%] min-w-[95%] p-4">
              <DialogHeader className="sr-only">
                <DialogTitle>Preview</DialogTitle>
              </DialogHeader>

              <EmailPreview />
            </DialogContent>
          </Dialog>
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            <span className="hidden md:block">
              {isSaving ? (
                <>
                  <div className="flex h-4 w-4 animate-spin items-center justify-center">
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
                  <div className="flex h-4 w-4 animate-spin items-center justify-center">
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
        collisionDetection={customCollisionDetection}
      >
        <div className="relative flex p-2 md:gap-4 md:p-4">
          <DndBuilderSidebar
            type="content"
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
            courseId={courseId}
            onlineUsers={onlineUsers}
            organizationId={organizationId}
          />
          <div className="relative flex-1">
            <AnimatePresence>
              {selectedBlockId &&
                blocks.find((block) => block.id === selectedBlockId)?.type ===
                  "text" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 44 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, damping: 20 }}
                    className="sticky top-12 z-50 overflow-hidden bg-background"
                  >
                    <Toolbar
                      editor={editors[selectedBlockId]}
                      defaultTextColor={initialStyles.defaultTextColor}
                      accentTextColor={initialStyles.accentTextColor}
                    />
                  </motion.div>
                )}
            </AnimatePresence>
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <DndBuilderCanvas
                type="content"
                blocks={blocks}
                bgColor={initialStyles.bgColor}
                isInset={initialStyles.isInset}
                isRounded={initialStyles.isRounded}
                emailBgColor={initialStyles.emailBgColor}
                onBlockSelect={setSelectedBlockId}
                selectedBlockId={selectedBlockId}
                editors={editors}
                onTextContentChange={handleTextContentChange}
                setActiveForm={setActiveForm}
                activeForm={activeForm}
                defaultFont={initialStyles.defaultFont}
                defaultTextColor={initialStyles.defaultTextColor}
                linkColor={initialStyles.linkColor}
                accentTextColor={initialStyles.accentTextColor}
                isUndoRedoOperation={isUndoRedoOperation}
              />
            </SortableContext>
          </div>
        </div>
        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>
      <EmailBuilderRealtimeListener onOnlineUsersChange={setOnlineUsers} />
    </div>
  );
}
