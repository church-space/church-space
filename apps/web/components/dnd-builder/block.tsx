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
    >
      {type === "divider" && <DividerBlock data={block.data} />}
      {type === "image" && <ImageBlock />}
      {type === "file-download" && <FileDownloadBlock />}
      {type === "video" && <VideoBlock />}
      {type === "cards" && <CardsBlock />}
      {type === "author" && <AuthorBlock data={block.data} />}
      {type === "text" && <TextBlock editor={editor} />}
      {type === "button" && <ButtonBlock data={block.data} />}
      {type === "list" && <ListBlock data={block.data} />}
    </div>
  );
}
