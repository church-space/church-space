"use client";

import { useEmailWithBlocks } from "@/hooks/use-email-with-blocks";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type {
  BlockData,
  Block as BlockType,
  ButtonBlockData,
  DividerBlockData,
} from "@/types/blocks";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Eye, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import Block from "./block";
import DndBuilderCanvas from "./canvas";
import EmailPreview from "./email-preview";
import { useAddEmailBlock } from "./mutations/use-add-email-block";
import { useBatchUpdateEmailBlocks } from "./mutations/use-batch-update-email-blocks";
import { useDeleteEmailBlock } from "./mutations/use-delete-email-block";
import { useUpdateEmailBlock } from "./mutations/use-update-email-block";
import { useUpdateEmailStyle } from "./mutations/use-update-email-style";
import { createEditor, updateEditorColors } from "./rich-text-editor/editor";
import Toolbar from "./rich-text-editor/rich-text-format-bar";
import SendTestEmail from "./send-test-email";
import DndBuilderSidebar, { allBlockTypes } from "./sidebar";
import { EmailStyles, useBlockStateManager } from "./use-block-state-manager";
import { useUpdateEmailFooter } from "./mutations/use-update-email-footer";
import { DatabaseBlockType, OrderUpdate, ContentUpdate } from "./dnd-types";
import NewEmailModal from "./new-email-modal";
import { deleteEmailAction } from "@/actions/delete-email";
import { updateEmailAction } from "@/actions/update-email";
import { useToast } from "@church-space/ui/use-toast";
import type { ActionResponse } from "@/types/action";
import { getOrgFooterDetailsAction } from "@/actions/get-org-footer-details";

export default function EmailDndProvider({
  organizationId,
}: {
  organizationId: string;
}) {
  // Move all hooks to the top level
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showMobileWarning, setShowMobileWarning] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const hasSeenWarning = localStorage.getItem("mobile_warning_dismissed");
      return hasSeenWarning !== "true";
    }
    return true;
  });
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
  const [newEmailModalOpen = false] = useQueryState("newEmail", parseAsBoolean);
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
    "default" | "block" | "email-style" | "email-footer" | "email-templates"
  >("default");
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );
  const updateEmailFooter = useUpdateEmailFooter();
  const { toast } = useToast();

  const { data: orgFooterDetails } = useQuery({
    queryKey: ["orgFooterDetails", organizationId],
    queryFn: () => getOrgFooterDetailsAction({ organizationId }),
  });

  // Initialize blocks and styles
  const initialBlocks =
    (emailData?.blocks?.map((block) => ({
      id: block.id.toString(),
      type: block.type as BlockType["type"],
      order: block.order || 0,
      data: block.value as unknown as BlockData,
    })) as BlockType[]) || [];

  // Use type assertion to avoid TypeScript errors
  const email = emailData?.email as any;
  const emailStyle = email?.style || {};

  const initialStyles: EmailStyles = {
    bgColor: emailStyle.blocks_bg_color || "#f4f4f5",
    isInset: emailStyle.is_inset ?? true,
    emailBgColor: emailStyle.bg_color || "#ffffff",
    linkColor: emailStyle.link_color || "#0000ff",
    defaultTextColor: emailStyle.default_text_color || "#000000",
    defaultFont: emailStyle.default_font || "sans-serif",
    cornerRadius: emailStyle.corner_radius || 0,
    blockSpacing: emailStyle.block_spacing || 20,
    accentTextColor: emailStyle.accent_text_color || "#666666",
  };

  const {
    blocks,
    styles,
    updateBlocksHistory,
    updateStylesHistory,
    updateFooterHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setCurrentState,
    footer,
  } = useBlockStateManager(
    initialBlocks,
    initialStyles,
    emailData?.footer || null,
  );

  // Create a debounced function for style updates to reduce API calls
  const debouncedStyleUpdate = useCallback(
    debounce((updates: Record<string, any>) => {
      if (emailId && Object.keys(updates).length > 0) {
        updateEmailStyle.mutate({
          emailId,
          updates,
        });
      }
    }, 500),
    [emailId, updateEmailStyle],
  );

  // Function to update footer on the server
  const updateFooterOnServer = useCallback(
    (footerData: any) => {
      if (!emailId || !organizationId || !footerData) return;

      // Use the updateEmailFooter mutation directly
      updateEmailFooter.mutate({
        emailId,
        organizationId,
        updates: footerData,
      });
    },
    [emailId, organizationId, updateEmailFooter],
  );

  // Function to update styles on the server based on EmailStyles object
  const updateStylesOnServer = useCallback(
    (styleObj: EmailStyles) => {
      if (!emailId) return;

      debouncedStyleUpdate({
        blocks_bg_color: styleObj.bgColor,
        default_text_color: styleObj.defaultTextColor,
        accent_text_color: styleObj.accentTextColor,
        default_font: styleObj.defaultFont,
        is_inset: styleObj.isInset,
        corner_radius: styleObj.cornerRadius,
        block_spacing: styleObj.blockSpacing,
        bg_color: styleObj.emailBgColor,
        link_color: styleObj.linkColor,
      });
    },
    [emailId, debouncedStyleUpdate],
  );

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
          (update): update is { id: number; order: number } => update !== null,
        );

      // Only update blocks that already exist in the database (have numeric IDs)
      if (orderUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          orderUpdates,
        });
      }
    },
    [emailId, batchUpdateEmailBlocks],
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
    [updateEmailBlock],
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

    // Update the UI immediately - this will add to history
    updateBlocksHistory(sortedBlocks);

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
        if (emailId) {
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

    // Check block limit before adding a new block
    if (blocks.length >= 50) {
      toast({
        variant: "destructive",
        title: "Block Limit Reached",
        description: "You cannot add more than 50 blocks to an email.",
      });
      return;
    }

    let newBlocks;
    let newBlockOrder;

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
        title: "",
        file: "",
        bgColor: "#f0f0f0",
        textColor: "#000000",
      };
    } else if (blockType === "divider") {
      blockData = {
        color: styles.defaultTextColor,
        margin: 0,
        thickness: 1,
      };
    } else if (blockType === "button") {
      blockData = {
        text: "",
        link: "",
        color: styles.defaultTextColor,
        textColor: styles.bgColor,
        style: "filled" as "filled" | "outline",
        size: "fit" as "fit" | "full",
        centered: true,
      };
    } else if (blockType === "list") {
      blockData = {
        title: "",
        subtitle: "",
        textColor: "#000000",
        bulletColor: "#000000",
        bulletType: "number",
        items: [
          {
            title: "",
            description: "",
            order: 0,
          },
        ],
      };
    } else if (blockType === "cards") {
      blockData = {
        title: "",
        subtitle: "",
        textColor: styles.defaultTextColor,
        labelColor: styles.accentTextColor,
        buttonColor: styles.accentTextColor,
        buttonTextColor: styles.bgColor,
        buttonSize: "fit",
        buttonStyle: "filled",
        cards: [
          {
            title: "Card One",
            description: "Card One Description",
            label: "",
            buttonText: "",
            buttonLink: "",
            image: "",
            order: 0,
          },
          {
            title: "Card Two",
            description: "Card Two Description",
            label: "",
            buttonText: "",
            buttonLink: "",
            image: "",
            order: 0,
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
        styles.defaultFont,
        styles.defaultTextColor,
        true, // preserve existing styles
        styles.accentTextColor,
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
    if (emailId) {
      // First update the UI optimistically
      // Then add to database
      addEmailBlock.mutate(
        {
          emailId,
          type: blockType,
          value: blockData,
          order: newBlockOrder,
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

              if (!isMobile) {
                // Set the newly created block as the selected block
                setSelectedBlockId(result.id.toString());
              }

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
          },
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
            matchingDbBlock.id.toString(),
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
        // Check block limit before duplicating
        if (blocks.length >= 50) {
          toast({
            variant: "destructive",
            title: "Block Limit Reached",
            description: "You cannot add more than 50 blocks to an email.",
          });
          return;
        }

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
        if (emailId) {
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
                  text: "",
                  link: "#",
                  color: "#000000",
                  textColor: "#ffffff",
                  style: "filled",
                  size: "fit",
                  centered: true,
                };
                break;
              case "divider":
                blockValue = {
                  color: "#000000",
                  margin: 20,
                  thickness: 1,
                };
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
                  bgColor: "#f0f0f0",
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
                  buttonSize: "fit",
                  buttonStyle: "filled",
                  cards: [],
                };
                break;
              case "list":
                blockValue = {
                  title: "",
                  subtitle: "",
                  textColor: "#000000",
                  bulletColor: "#000000",
                  bulletType: "number",
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
                  linkColor: "#000000",
                  hideAvatar: false,
                };
                break;
              default:
                // This should never happen as we're duplicating an existing block
                blockValue = { content: "" } as BlockData;
            }
          } else {
            blockValue = updatedBlock.data;
          }

          addEmailBlock.mutate(
            {
              emailId,
              type: updatedBlock.type,
              value: blockValue,
              order: insertIndex,
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
      updateBlocksHistory,
      updateEmailBlock,
      addEmailBlock,
      setSelectedBlockId,
      updateBlockOrdersInDatabase,
    ],
  );

  // Update activeForm when selectedBlock changes

  useEffect(() => {
    if (selectedBlockId) {
      setActiveForm("block");
    } else {
      // Only revert to the default form if we were showing the block form.
      setActiveForm((prev) => (prev === "block" ? "default" : prev));
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
          styles.defaultFont,
          styles.defaultTextColor,
          true, // preserve existing styles
          styles.accentTextColor,
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
            cornerRadius={styles.cornerRadius}
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
          cornerRadius={styles.cornerRadius}
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
          accent_text_color: styles.accentTextColor,
          default_font: styles.defaultFont,
          is_inset: styles.isInset,
          corner_radius: styles.cornerRadius,
          block_spacing: styles.blockSpacing,
          bg_color: styles.emailBgColor,
          link_color: styles.linkColor,
        },
      });

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
          const result = await addEmailBlock.mutateAsync({
            emailId,
            type: block.type,
            value: block.data || ({} as BlockData),
            order: block.order,
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
        await batchUpdateEmailBlocks.mutateAsync({
          emailId,
          orderUpdates,
          contentUpdates,
        });
      }

      // Refresh the email data to get the latest block IDs
      queryClient.invalidateQueries({ queryKey: ["email", emailId] });

      if (emailData?.email?.type === "template") {
        // Navigate to the emails page with the emailId
        router.push(`/emails/templates`);
      } else {
        // Navigate to the emails page with the emailId
        router.push(`/emails/${emailId}`);
      }

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
    styles.cornerRadius,
    styles.blockSpacing,
    styles.emailBgColor,
    styles.linkColor,
    styles.accentTextColor,
    blocks,
    queryClient,
    router,
    emailData?.email?.type,
    updateBlocksHistory,
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
    if (!emailData || !emailData.blocks || !blocks) return;

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
        (a, b) => (a.order || 0) - (b.order || 0),
      );

      updateBlocksHistory(sortedBlocks);
    }
  }, [emailData, blocks, updateBlocksHistory, blocksBeingDeleted]);

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

  // Create a ref for footer update debouncing
  const debouncedFooterUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Handle footer changes locally before sending to server
  const handleFooterChange = (updatedFooter: any) => {
    // Add to history system - this will update the UI state immediately
    updateFooterHistory(updatedFooter);

    // Debounce the server update
    if (debouncedFooterUpdateRef.current) {
      clearTimeout(debouncedFooterUpdateRef.current);
    }

    debouncedFooterUpdateRef.current = setTimeout(() => {
      // Update the server
      updateFooterOnServer(updatedFooter);
    }, 500);
  };

  // Create a ref for style update debouncing
  const debouncedStyleUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const handleAllStyleChanges = useCallback(
    (styleUpdates: Partial<EmailStyles>) => {
      // Update UI immediately with all changes at once
      updateStylesHistory(styleUpdates);

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        if (emailId) {
          // Convert to database format
          debouncedStyleUpdate({
            blocks_bg_color: styleUpdates.bgColor,
            bg_color: styleUpdates.emailBgColor,
            default_text_color: styleUpdates.defaultTextColor,
            link_color: styleUpdates.linkColor,
            accent_text_color: styleUpdates.accentTextColor,
            default_font: styleUpdates.defaultFont,
            is_inset: styleUpdates.isInset,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleBgColorChange to include history update
  const handleBgColorChange = useCallback(
    (color: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ bgColor: color });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            blocks_bg_color: color,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleIsInsetChange to include history update
  const handleIsInsetChange = useCallback(
    (inset: boolean) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ isInset: inset });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            is_inset: inset,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleCornerRadiusChange to include history update
  const handleCornerRadiusChange = useCallback(
    (rounded: number) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ cornerRadius: rounded });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            corner_radius: rounded,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  const handleBlockSpacingChange = useCallback(
    (spacing: number) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ blockSpacing: spacing });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            block_spacing: spacing,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleEmailBgColorChange to include history update
  const handleEmailBgColorChange = useCallback(
    (color: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ emailBgColor: color });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            bg_color: color,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleLinkColorChange to include history update
  const handleLinkColorChange = useCallback(
    (color: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ linkColor: color });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        if (emailId) {
          debouncedStyleUpdate({
            link_color: color,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  // Fix handleDefaultTextColorChange to include history update
  const handleDefaultTextColorChange = useCallback(
    (color: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ defaultTextColor: color });

      // Update all editors with the new default text color
      Object.values(editors).forEach((editor) => {
        if (editor && !editor.isDestroyed) {
          updateEditorColors(editor, color, styles.accentTextColor);
        }
      });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            default_text_color: color,
          });
        }
      }, 500);
    },
    [
      emailId,
      debouncedStyleUpdate,
      updateStylesHistory,
      editors,
      styles.accentTextColor,
    ],
  );

  // Fix handleDefaultFontChange to include history update
  const handleDefaultFontChange = useCallback(
    (font: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ defaultFont: font });

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            default_font: font,
          });
        }
      }, 500);
    },
    [emailId, debouncedStyleUpdate, updateStylesHistory],
  );

  const handleAccentTextColorChange = useCallback(
    (color: string) => {
      // Update UI immediately - this will add to history
      updateStylesHistory({ accentTextColor: color });

      // Update all editors with the new accent text color
      Object.values(editors).forEach((editor) => {
        if (editor && !editor.isDestroyed) {
          updateEditorColors(editor, styles.defaultTextColor, color);
        }
      });

      // Update all card blocks to use the new accent color for labels
      const updatedBlocks = blocks.map((block) => {
        if (block.type === "cards" && block.data) {
          return {
            ...block,
            data: {
              ...block.data,
              labelColor: color,
            } as BlockType["data"],
          } as BlockType;
        }
        return block;
      });

      // Only update blocks if there were changes
      if (JSON.stringify(blocks) !== JSON.stringify(updatedBlocks)) {
        updateBlocksHistory(updatedBlocks);
      }

      // Debounce the database update
      if (debouncedStyleUpdateRef.current) {
        clearTimeout(debouncedStyleUpdateRef.current);
      }

      debouncedStyleUpdateRef.current = setTimeout(() => {
        // Update in database if we have an emailId
        if (emailId) {
          debouncedStyleUpdate({
            accent_text_color: color,
          });

          // Update any card blocks in the database
          updatedBlocks.forEach((block) => {
            if (block.type === "cards" && !isNaN(parseInt(block.id, 10))) {
              const blockId = parseInt(block.id, 10);
              updateEmailBlock.mutate({
                blockId,
                value: block.data,
              });
            }
          });
        }
      }, 500);
    },
    [
      emailId,
      debouncedStyleUpdate,
      updateStylesHistory,
      editors,
      styles.defaultTextColor,
      blocks,
      updateBlocksHistory,
      updateEmailBlock,
    ],
  );

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

        // Always use the default font and color from email settings
        const newEditor = createEditor(
          initialContent,
          styles.defaultFont,
          styles.defaultTextColor,
          true, // preserve existing styles
          styles.accentTextColor,
        );
        newEditors[block.id] = newEditor;
      });

      setEditors(newEditors);
    }
  }, [
    blocks,
    styles.defaultFont,
    styles.defaultTextColor,
    editors,
    styles.accentTextColor,
  ]);

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
      // Update the blocks  adding to history
      updateBlocksHistory(updatedBlocks);

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
            (block) => block.type === "text" && !isNaN(parseInt(block.id, 10)),
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
    updateBlocksHistory,
    batchUpdateEmailBlocks,
  ]);

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
      if (!emailId) return;

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
          deleteEmailBlock.mutate({ blockId });
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
          addEmailBlock.mutate(
            {
              emailId,
              type: block.type,
              value: block.data || ({} as BlockData),
              order: block.order,
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
                queryClient.invalidateQueries({ queryKey: ["email", emailId] });
              },
            },
          );
        }
      });

      // 6. Process updated blocks (if they have numeric IDs, update on server)
      updatedBlocks.forEach((block) => {
        if (!isNaN(parseInt(block.id, 10))) {
          const blockId = parseInt(block.id, 10);
          updateEmailBlock.mutate({
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

        if (orderUpdates.length > 0 && emailId) {
          batchUpdateEmailBlocks.mutate({
            emailId,
            orderUpdates,
          });
        }
      }, 1000); // Wait a bit to ensure all block creations have completed
    }, 500),
    [
      emailId,
      addEmailBlock,
      deleteEmailBlock,
      updateEmailBlock,
      batchUpdateEmailBlocks,
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
    const stylesBeforeUndo = { ...styles };
    const footerBeforeUndo = footer;

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

      // For restored blocks, remove them from permanentlyDeletedBlocksRef and blocksBeingDeleted
      const restoredBlockIds = new Set<string>();
      restoredBlocks.forEach((block) => {
        permanentlyDeletedBlocksRef.current.delete(block.id);
        if (!isNaN(parseInt(block.id, 10))) {
          permanentlyDeletedBlocksRef.current.delete(
            parseInt(block.id, 10).toString(),
          );
          restoredBlockIds.add(block.id);
          restoredBlockIds.add(parseInt(block.id, 10).toString());
        }

        setBlocksBeingDeleted((prev) => {
          const newSet = new Set(prev);
          newSet.delete(block.id);
          if (!isNaN(parseInt(block.id, 10))) {
            newSet.delete(parseInt(block.id, 10).toString());
          }
          return newSet;
        });

        // If this is a block that was previously in the database (has numeric ID),
        // we need to recreate it on the server
        if (emailId && !isNaN(parseInt(block.id, 10))) {
          addEmailBlock.mutate(
            {
              emailId,
              type: block.type,
              value: block.data as BlockData,
              order: block.order,
            },
            {
              onSuccess: (result) => {
                if (result && result.id) {
                  // Update the block ID in our local state to use the database ID
                  const updatedBlocks = previousState.blocks.map((b) =>
                    b.id === block.id ? { ...b, id: result.id.toString() } : b,
                  );

                  // Update the UI with the new ID
                  setCurrentState({
                    blocks: updatedBlocks,
                    styles: previousState.styles,
                    footer: previousState.footer,
                  });

                  // Update block orders in database to ensure correct positioning
                  updateBlockOrdersInDatabase(updatedBlocks);
                }
              },
            },
          );
        }
      });

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

      // Update server state based on the differences, excluding restored blocks that we're already handling
      const nonRestoredBlocks = previousState.blocks.filter(
        (block) =>
          !restoredBlockIds.has(block.id) &&
          !restoredBlockIds.has(parseInt(block.id, 10)?.toString()),
      );
      debouncedServerUpdate(nonRestoredBlocks, blocksBeforeUndo);

      // Check if styles have changed and update on server if needed
      if (
        JSON.stringify(previousState.styles) !==
        JSON.stringify(stylesBeforeUndo)
      ) {
        updateStylesOnServer(previousState.styles);
      }

      // Check if footer has changed and update on server if needed
      if (
        JSON.stringify(previousState.footer) !==
        JSON.stringify(footerBeforeUndo)
      ) {
        updateFooterOnServer(previousState.footer);
      }

      // Update editor content for text blocks
      previousState.blocks.forEach((block) => {
        if (
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
    styles,
    debouncedServerUpdate,
    updateStylesOnServer,
    updateFooterOnServer,
    editors,
    setEditors,
    setBlocksBeingDeleted,
    setCurrentState,
    addEmailBlock,
    emailId,
    footer,
    updateBlockOrdersInDatabase,
  ]);

  // Handle redo button click
  const handleRedo = useCallback(() => {
    // Set flag to prevent recursive updates
    setIsUndoRedoOperation(true);

    // Store the current blocks before the redo operation
    const blocksBeforeRedo = [...blocks];
    const stylesBeforeRedo = { ...styles };
    const footerBeforeRedo = footer;

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

      // Check if styles have changed and update on server if needed
      if (
        JSON.stringify(nextState.styles) !== JSON.stringify(stylesBeforeRedo)
      ) {
        updateStylesOnServer(nextState.styles);
      }

      // Check if footer has changed and update on server if needed
      if (
        JSON.stringify(nextState.footer) !== JSON.stringify(footerBeforeRedo)
      ) {
        updateFooterOnServer(nextState.footer);
      }

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
              styles.defaultFont,
              styles.defaultTextColor,
              true, // preserve existing styles
              styles.accentTextColor,
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
    styles,
    debouncedServerUpdate,
    updateStylesOnServer,
    updateFooterOnServer,
    editors,
    setEditors,
    styles.defaultFont,
    styles.defaultTextColor,
    styles.accentTextColor,
    setBlocksBeingDeleted,
    setCurrentState,
    footer,
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
  }, [blocks, styles, canUndo, canRedo, canUndoValue, canRedoValue]);

  const handleDeleteTemplate = async () => {
    if (!emailId) return;

    try {
      const result = (await deleteEmailAction({
        emailId,
        isTemplate: true,
      })) as ActionResponse<any>;

      if (!result.data.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.data.error || "Failed to delete template",
        });
        return;
      }

      // If successful, show success message before redirect
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      router.push("/emails/templates");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete template",
      });
    }
  };

  const handleEmailSubjectChange = async (subject: string) => {
    if (!emailId) return;

    try {
      const result = (await updateEmailAction({
        email_id: emailId,
        email_data: {
          subject,
        },
      })) as ActionResponse<any>;

      if (!result.data.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update template name",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Template name updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update template name",
      });
    }
  };

  const handleApplyToAllButtons = (currentBlock: string | null) => {
    if (!currentBlock) return;

    // Find the source button block
    const sourceBlock = blocks.find((block) => block.id === currentBlock);
    if (!sourceBlock || sourceBlock.type !== "button") return;

    // Get all button blocks
    const updatedBlocks = blocks.map((block) => {
      if (block.type === "button" && block.id !== currentBlock) {
        // Apply the source block's styling but keep the original text and link
        const originalData = block.data as ButtonBlockData;
        const sourceData = sourceBlock.data as ButtonBlockData;
        return {
          ...block,
          data: {
            ...sourceData,
            text: originalData.text,
            link: originalData.link,
          } as ButtonBlockData,
        } as BlockType;
      }
      return block;
    });

    // Update history with the new blocks
    updateBlocksHistory(updatedBlocks);

    // Update blocks in database if we have an emailId
    if (emailId) {
      const contentUpdates: ContentUpdate[] = updatedBlocks
        .filter(
          (block) => block.type === "button" && !isNaN(parseInt(block.id, 10)),
        )
        .map((block) => ({
          id: parseInt(block.id, 10),
          type: block.type as DatabaseBlockType,
          value: block.data,
        }));

      if (contentUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          contentUpdates,
        });
      }
    }
  };

  const handleApplyToAllDividers = (currentBlock: string | null) => {
    if (!currentBlock) return;

    // Find the source divider block
    const sourceBlock = blocks.find((block) => block.id === currentBlock);
    if (!sourceBlock || sourceBlock.type !== "divider") return;

    // Get all divider blocks
    const updatedBlocks = blocks.map((block) => {
      if (block.type === "divider" && block.id !== currentBlock) {
        // Apply the source block's styling
        const sourceData = sourceBlock.data as DividerBlockData;
        return {
          ...block,
          data: { ...sourceData } as DividerBlockData,
        } as BlockType;
      }
      return block;
    });

    // Update history with the new blocks
    updateBlocksHistory(updatedBlocks);

    // Update blocks in database if we have an emailId
    if (emailId) {
      const contentUpdates: ContentUpdate[] = updatedBlocks
        .filter(
          (block) => block.type === "divider" && !isNaN(parseInt(block.id, 10)),
        )
        .map((block) => ({
          id: parseInt(block.id, 10),
          type: block.type as DatabaseBlockType,
          value: block.data,
        }));

      if (contentUpdates.length > 0) {
        batchUpdateEmailBlocks.mutate({
          emailId,
          contentUpdates,
        });
      }
    }
  };

  // Track last selected style and footer from NewEmailModal
  const [lastModalStyleUpdates, setLastModalStyleUpdates] =
    useState<Partial<EmailStyles> | null>(null);
  const [lastModalFooterUpdates, setLastModalFooterUpdates] =
    useState<any>(null);

  // Handle style changes from modal with local state tracking
  const handleModalStyleChanges = useCallback(
    (styleUpdates: Partial<EmailStyles>) => {
      // Store the updates for useEffect to process
      setLastModalStyleUpdates(styleUpdates);

      // Also call the normal handler for DB updates
      handleAllStyleChanges(styleUpdates);
    },
    [handleAllStyleChanges],
  );

  // Handle footer changes from modal with local state tracking
  const handleModalFooterChanges = useCallback(
    (footerUpdates: any) => {
      // Store the updates for useEffect to process
      setLastModalFooterUpdates(footerUpdates);

      // Also call the normal handler for DB updates
      handleFooterChange(footerUpdates);
    },
    [handleFooterChange],
  );

  // Apply stored style and footer updates when modal closes
  useEffect(() => {
    if (
      !newEmailModalOpen &&
      (lastModalStyleUpdates || lastModalFooterUpdates)
    ) {
      // Force an update to the current state
      setCurrentState((prevState) => {
        const newState = { ...prevState };

        // Apply style updates if they exist
        if (lastModalStyleUpdates) {
          newState.styles = {
            ...newState.styles,
            ...lastModalStyleUpdates,
          };
        }

        // Apply footer updates if they exist
        if (lastModalFooterUpdates) {
          newState.footer = {
            ...newState.footer,
            ...lastModalFooterUpdates,
          };
        }

        return newState;
      });

      // Reset the stored updates
      setLastModalStyleUpdates(null);
      setLastModalFooterUpdates(null);
    }
  }, [
    newEmailModalOpen,
    lastModalStyleUpdates,
    lastModalFooterUpdates,
    setCurrentState,
  ]);

  return (
    <div className="relative flex h-full flex-col">
      <Dialog
        open={isMobile && showMobileWarning}
        onOpenChange={(open) => {
          if (!open) {
            localStorage.setItem("mobile_warning_dismissed", "true");
          }
          setShowMobileWarning(open);
        }}
      >
        <DialogContent className="max-w-[94%] rounded-lg">
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
            <Button
              onClick={() => {
                localStorage.setItem("mobile_warning_dismissed", "true");
                setShowMobileWarning(false);
              }}
            >
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <header className="sticky left-0 right-0 top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/emails" className="hidden md:block">
                <BreadcrumbItem>Emails</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />

              <Link
                href={
                  emailData?.email?.type === "template"
                    ? `/emails/templates`
                    : `/emails/${emailId}`
                }
              >
                <BreadcrumbItem className="max-w-32 truncate sm:max-w-sm">
                  {(emailData?.email as any)?.subject || "Email Subject"}
                </BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>
                  {emailData?.email?.type === "template" ? (
                    <span>Template Editor</span>
                  ) : (
                    <span>Designer</span>
                  )}
                </BreadcrumbPage>
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

              <EmailPreview orgFooterDetails={orgFooterDetails?.data?.data} />
            </DialogContent>
          </Dialog>
          <SendTestEmail orgFooterDetails={orgFooterDetails?.data?.data} />
          <Button variant="default" onClick={handleSave} disabled={isSaving}>
            <span className="hidden md:block">
              {isSaving ? (
                <div className="flex items-center gap-1">
                  <div className="flex h-4 w-4 animate-spin items-center justify-center">
                    <LoaderIcon />
                  </div>
                  <span>Saving...</span>
                </div>
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
            type="email"
            onBgColorChange={handleBgColorChange}
            bgColor={styles.bgColor}
            defaultTextColor={styles.defaultTextColor}
            onDefaultTextColorChange={handleDefaultTextColorChange}
            defaultFont={styles.defaultFont}
            onDefaultFontChange={handleDefaultFontChange}
            isInset={styles.isInset}
            onIsInsetChange={handleIsInsetChange}
            cornerRadius={styles.cornerRadius}
            onCornerRadiusChange={handleCornerRadiusChange}
            blockSpacing={styles.blockSpacing}
            onBlockSpacingChange={handleBlockSpacingChange}
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
            footerData={footer}
            onFooterChange={handleFooterChange}
            linkColor={styles.linkColor}
            onLinkColorChange={handleLinkColorChange}
            accentTextColor={styles.accentTextColor}
            onAccentTextColorChange={handleAccentTextColorChange}
            organizationId={organizationId}
            isTemplate={emailData?.email?.type === "template"}
            emailSubject={emailData?.email?.subject || ""}
            onEmailSubjectChange={handleEmailSubjectChange}
            onDeleteTemplate={handleDeleteTemplate}
            onApplyToAllButtons={() => handleApplyToAllButtons(selectedBlockId)}
            onApplyToAllDividers={() =>
              handleApplyToAllDividers(selectedBlockId)
            }
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
                      defaultTextColor={styles.defaultTextColor}
                      accentTextColor={styles.accentTextColor}
                    />
                  </motion.div>
                )}
            </AnimatePresence>
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <DndBuilderCanvas
                type="email"
                blocks={blocks}
                bgColor={styles.bgColor}
                isInset={styles.isInset}
                cornerRadius={styles.cornerRadius}
                blockSpacing={styles.blockSpacing}
                emailBgColor={styles.emailBgColor}
                onBlockSelect={setSelectedBlockId}
                selectedBlockId={selectedBlockId}
                editors={editors}
                onTextContentChange={handleTextContentChange}
                setActiveForm={setActiveForm}
                activeForm={activeForm}
                footerData={footer}
                defaultFont={styles.defaultFont}
                defaultTextColor={styles.defaultTextColor}
                linkColor={styles.linkColor}
                accentTextColor={styles.accentTextColor}
                isUndoRedoOperation={isUndoRedoOperation}
                orgFooterDetails={orgFooterDetails?.data}
                onDeleteBlock={handleDeleteBlock}
                onBlockUpdate={handleBlockUpdate}
              />
            </SortableContext>
          </div>
        </div>
        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>

      <NewEmailModal
        onFooterChange={handleModalFooterChanges}
        onAllStyleChanges={handleModalStyleChanges}
        setCurrentState={setCurrentState}
      />
    </div>
  );
}
