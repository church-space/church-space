import React from "react";
import { Grip, Trash } from "@trivo/ui/icons";
import { Button } from "@trivo/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@trivo/ui/tooltip";

interface BlockProps {
  type: string;
}

export default function Block({ type }: BlockProps) {
  return (
    <div className="w-full  flex justify-center relative group">
      <div className="absolute top-0 right-4  items-center justify-center bg-accent border rounded-md hidden group-hover:flex">
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
            <div className="rounded-l-none  bg-accent  rounded-md transition-colors cursor-grab flex items-center justify-center w-7 pr-1">
              <Grip />
            </div>
          </TooltipTrigger>
          <TooltipContent>Move</TooltipContent>
        </Tooltip>
      </div>
      <div className="max-w-2xl w-full  p-2 px-3">{type.toUpperCase()}</div>
    </div>
  );
}
