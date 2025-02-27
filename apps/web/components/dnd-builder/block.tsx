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
            onContentChange={(content) => {
              if (id && onTextContentChange) {
                onTextContentChange(id, content);
              }
            }}
            font={block.data?.font}
            textColor={block.data?.textColor}
          />
        );
      case "divider":
        return <DividerBlock data={block.data} />;
      case "image":
        return <ImageBlock data={block.data} />;
      case "file-download":
        return (
          <FileDownloadBlock data={block.data} defaultFont={defaultFont} />
        );
      case "video":
        return <VideoBlock data={block.data} />;
      case "cards":
        return (
          <CardsBlock
            data={block.data}
            defaultFont={defaultFont}
            defaultTextColor={defaultTextColor}
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
        return <ButtonBlock data={block.data} defaultFont={defaultFont} />;
      case "list":
        return (
          <ListBlock
            data={block.data}
            defaultFont={defaultFont}
            defaultTextColor={defaultTextColor}
          />
        );
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
        "relative mx-auto w-full max-w-2xl rounded-md p-4 border border-transparent hover:border-border group/block",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500",
        isOverlay && "opacity-80 shadow-lg"
      )}
      onClick={(e) => onSelect?.(e)}
      data-block-id={id}
    >
      {renderBlock()}
    </div>
  );
}
