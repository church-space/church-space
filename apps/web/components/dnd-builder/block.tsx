import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Editor } from "@tiptap/react";
import { cn } from "@trivo/ui/cn";
import React from "react";
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
}: BlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id || "temp-id",
      data: {
        type,
        id,
      },
      disabled: isOverlay,
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
          />
        );
      case "divider":
        return <DividerBlock data={block.data} />;
      case "image":
        return <ImageBlock data={block.data} />;
      case "file-download":
        return <FileDownloadBlock data={block.data} />;
      case "video":
        return <VideoBlock data={block.data} />;
      case "cards":
        return <CardsBlock data={block.data} />;
      case "author":
        return <AuthorBlock data={block.data} />;
      case "button":
        return <ButtonBlock data={block.data} />;
      case "list":
        return <ListBlock data={block.data} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
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
