import { cn } from "@church-space/ui/cn";
import { Label } from "@church-space/ui/label";
import React from "react";
import ColorPicker from "../dnd-builder/color-picker";
import { Separator } from "@church-space/ui/separator";
import { FooterIcon, ChevronRight } from "@church-space/ui/icons";

interface LinkListBuilderSidebarProps {
  className?: string;
}

export default function LinkListBuilderSidebar({
  className,
}: LinkListBuilderSidebarProps) {
  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 space-y-4 overflow-hidden rounded-md border bg-sidebar p-4 shadow-sm md:w-[320px] lg:w-[400px]",
        className,
      )}
    >
      <div className="text-lg font-medium">Editor</div>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
        onClick={() => console.log("clicked")}
      >
        <div className="flex items-center gap-2">
          <FooterIcon />
          Header
        </div>
        <ChevronRight />
      </div>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
        onClick={() => console.log("clicked")}
      >
        <div className="flex items-center gap-2">
          <FooterIcon />
          Socials
        </div>
        <ChevronRight />
      </div>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border bg-accent py-3 pl-3 pr-2 text-sm shadow-sm transition-colors hover:bg-accent/80"
        onClick={() => console.log("clicked")}
      >
        <div className="flex items-center gap-2">
          <FooterIcon />
          Links
        </div>
        <ChevronRight />
      </div>
    </div>
  );
}
