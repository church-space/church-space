import { Button } from "@church-space/ui/button";
import { CircleQuestion } from "@church-space/ui/icons";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";

export default function SidebarHelpMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="size-7 gap-0 rounded-full p-0 text-muted-foreground [&_svg]:size-5"
          variant="ghost"
        >
          <CircleQuestion height={"18"} width={"18"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="min-w-52 -translate-x-2"
      >
        <DropdownMenuItem>Help</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
