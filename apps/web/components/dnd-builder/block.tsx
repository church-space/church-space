import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Editor } from "@tiptap/react";
import { cn } from "@church-space/ui/cn";
import React, { useState, useEffect } from "react";
import AuthorBlock from "./block-types/author";
import ButtonBlock from "./block-types/button";
import CardsBlock from "./block-types/cards";
import DividerBlock from "./block-types/divider";
import FileDownloadBlock from "./block-types/file-download";
import ImageBlock from "./block-types/image";
import ListBlock from "./block-types/list";
import TextBlock from "./block-types/text";
import VideoBlock from "./block-types/video";
import { Avatar, AvatarImage, AvatarFallback } from "@church-space/ui/avatar";
import QuizBlock from "./block-types/quiz";
import AudioBlock from "./block-types/audio";
import { Button } from "@church-space/ui/button";
import { Trash } from "@church-space/ui/icons";
import { Copy } from "lucide-react";
import type { Block as BlockType } from "@/types/blocks";

interface BlockProps {
  type: string;
  id?: string;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  editor: Editor | null;
  isOverlay?: boolean;
  block: any;
  onTextContentChange?: (blockId: string, content: string) => void;
  defaultFont?: string;
  defaultTextColor?: string;
  isRounded?: boolean;
  linkColor?: string;
  accentTextColor?: string;
  isUndoRedoOperation?: boolean;
  hasEditor?: boolean;
  onDeleteBlock?: (id: string) => void;
  onBlockUpdate?: (block: BlockType, isDuplication?: boolean) => void;
  setActiveForm?: (
    form:
      | "default"
      | "block"
      | "email-style"
      | "email-footer"
      | "email-templates",
  ) => void;
}

export default function Block({
  type,
  id,
  isDragging,
  isSelected,
  onSelect,
  editor,
  isOverlay,
  block,
  onTextContentChange,
  defaultFont,
  defaultTextColor,
  isRounded,
  linkColor,
  accentTextColor,
  isUndoRedoOperation = false,
  hasEditor = false,
  onDeleteBlock,
  onBlockUpdate,
  setActiveForm,
}: BlockProps) {
  // Add state to track if the editor is focused
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Set up effect to track editor focus state for text blocks
  useEffect(() => {
    if (type !== "text" || !editor || editor.isDestroyed) return;

    const handleFocus = () => {
      setIsEditorFocused(true);
    };

    const handleBlur = () => {
      setIsEditorFocused(false);
    };

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      if (!editor.isDestroyed) {
        editor.off("focus", handleFocus);
        editor.off("blur", handleBlur);
      }
    };
  }, [editor, type]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id || "temp-id",
      data: {
        type,
        id,
      },
      // Disable drag for text blocks when editor is focused
      disabled: isOverlay || (type === "text" && isEditorFocused),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderBlock = () => {
    switch (type) {
      case "text":
        return (
          <TextBlock
            editor={editor}
            onContentChange={
              id && onTextContentChange
                ? (content) => onTextContentChange(id, content)
                : undefined
            }
            font={block.data?.font || defaultFont}
            textColor={block.data?.textColor || defaultTextColor}
            linkColor={linkColor}
            accentTextColor={accentTextColor}
            isUndoRedoOperation={isUndoRedoOperation}
          />
        );
      case "divider":
        return <DividerBlock data={block.data} />;
      case "image":
        return <ImageBlock data={block.data} isRounded={isRounded} />;
      case "file-download":
        return (
          <FileDownloadBlock
            data={block.data}
            defaultFont={defaultFont}
            isRounded={isRounded}
          />
        );
      case "video":
        return <VideoBlock data={block.data} isRounded={isRounded} />;
      case "cards":
        return (
          <CardsBlock
            data={block.data}
            defaultFont={defaultFont}
            defaultTextColor={defaultTextColor}
            isRounded={isRounded}
          />
        );
      case "author":
        return (
          <AuthorBlock
            data={block.data}
            defaultFont={defaultFont}
            defaultTextColor={defaultTextColor}
          />
        );
      case "button":
        return (
          <ButtonBlock
            data={block.data}
            defaultFont={defaultFont}
            isRounded={isRounded}
          />
        );
      case "list":
        return (
          <ListBlock
            data={block.data}
            defaultFont={defaultFont}
            defaultTextColor={defaultTextColor}
          />
        );
      case "audio":
        return <AudioBlock />;
      case "quiz":
        return <QuizBlock />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay && !(type === "text" && isEditorFocused)
        ? listeners
        : {})}
      className={cn(
        "group relative mx-auto w-full max-w-2xl rounded-md border border-transparent p-1 hover:border-border",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500",
        isOverlay && "opacity-80 shadow-lg",
        hasEditor && "ring-2",
      )}
      onClick={(e) => onSelect?.(e)}
      data-block-id={id}
      data-block-type={type}
    >
      {hasEditor && (
        <div className="absolute -right-[17px] top-1/2 -translate-y-1/2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      )}
      {renderBlock()}
      {isSelected && (
        <div className="absolute -right-[2.7rem] -top-1 flex flex-col gap-0 rounded-md border bg-background">
          {onBlockUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (block && onBlockUpdate) {
                  // Create a deep copy of the selected block with a new ID
                  const duplicatedBlock = {
                    ...JSON.parse(JSON.stringify(block)), // Deep clone to avoid reference issues
                    id: crypto.randomUUID(), // Generate a new unique ID
                    duplicatedFromId: block.id, // Store the original block's ID
                  };

                  onBlockUpdate(duplicatedBlock, true);
                }
              }}
            >
              <Copy />
            </Button>
          )}
          {onDeleteBlock && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onDeleteBlock(id || "");
                setActiveForm?.("default");
              }}
              className="hover:text-destructive"
            >
              <Trash />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
