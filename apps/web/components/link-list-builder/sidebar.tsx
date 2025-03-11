import { cn } from "@church-space/ui/cn";
import React from "react";

interface LinkListBuilderSidebarProps {
  className?: string;
}

export default function LinkListBuilderSidebar({
  className,
}: LinkListBuilderSidebarProps) {
  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 overflow-hidden rounded-md border bg-sidebar p-4 shadow-sm md:w-[320px] lg:w-[400px]",
        className,
      )}
    >
      hi
    </div>
  );
}
