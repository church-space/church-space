import React from "react";
import { Grip, Trash } from "@trivo/ui/icons";
import { Button } from "@trivo/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@trivo/ui/tooltip";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DividerBlock from "./block-types/divider";
import ImageBlock from "./block-types/image";
import FileDownloadBlock from "./block-types/file-download";
import VideoBlock from "./block-types/video";
import CardsBlock from "./block-types/cards";
import AuthorBlock from "./block-types/author";
import TextBlock from "./block-types/text";
import ButtonBlock from "./block-types/button";
import ListBlock from "./block-types/list";
import { cn } from "@trivo/ui/cn";
import { Editor } from "@tiptap/react";

interface BlockProps {
  type: string;
  id?: string;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  editor: Editor | null;
  isOverlay?: boolean;
}

export default function Block({
  type,
  id,
  isDragging,
  isSelected,
  onSelect,
  editor,
  isOverlay,
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
        "relative mx-auto w-full max-w-2xl rounded-md p-4 border border-transparent hover:border-border",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-blue-500",
        isOverlay && "opacity-80 shadow-lg"
      )}
      onClick={(e) => onSelect?.(e)}
    >
      {type === "divider" && <DividerBlock />}
      {type === "image" && <ImageBlock />}
      {type === "file-download" && <FileDownloadBlock />}
      {type === "video" && <VideoBlock />}
      {type === "cards" && <CardsBlock />}
      {type === "author" && <AuthorBlock />}
      {type === "text" && <TextBlock editor={editor} />}
      {type === "button" && <ButtonBlock />}
      {type === "list" && <ListBlock />}
    </div>
  );
}
