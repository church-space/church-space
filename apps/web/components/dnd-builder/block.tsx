import React from "react";
import { Grip, Trash } from "@trivo/ui/icons";
import { Button } from "@trivo/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@trivo/ui/tooltip";
import { useDraggable } from "@dnd-kit/core";
import DividerBlock from "./block-types/divider";
import ImageBlock from "./block-types/image";
import FileDownloadBlock from "./block-types/file-download";
import VideoBlock from "./block-types/video";
import CardsBlock from "./block-types/cards";
import AuthorBlock from "./block-types/author";
import TextBlock from "./block-types/text";
import ButtonBlock from "./block-types/button";

interface BlockProps {
  type: string;
  id?: string;
  isDragging?: boolean;
}

export default function Block({ type, id, isDragging }: BlockProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id || "",
    data: { type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full flex justify-center relative group ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="max-w-2xl w-full p-2 px-3 relative">
        <div
          className={`absolute top-0 right-4 items-center justify-center bg-accent border rounded-md hidden group-hover:flex ${
            isDragging ? "opacity-0" : "opacity-100"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-none h-8 w-7 pl-1"
              >
                <Trash />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...attributes}
                {...listeners}
                className="rounded-l-none bg-accent rounded-md transition-colors cursor-grab flex items-center justify-center w-7 pr-1"
              >
                <Grip />
              </div>
            </TooltipTrigger>
            <TooltipContent>Move</TooltipContent>
          </Tooltip>
        </div>
        {type === "divider" && <DividerBlock />}
        {type === "image" && <ImageBlock />}
        {type === "file-download" && <FileDownloadBlock />}
        {type === "video" && <VideoBlock />}
        {type === "cards" && <CardsBlock />}
        {type === "author" && <AuthorBlock />}
        {type === "text" && <TextBlock />}
        {type === "button" && <ButtonBlock />}
      </div>
    </div>
  );
}
