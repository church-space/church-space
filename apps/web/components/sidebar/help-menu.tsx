import { Button } from "@church-space/ui/button";
import {
  Email,
  FilledCircleQuestion,
  Search,
  HandWave,
} from "@church-space/ui/icons";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import Link from "next/link";

export default function HelpMenu() {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild className="hidden md:block">
          <DropdownMenuTrigger asChild className="fixed bottom-3 left-3 z-50">
            <Button
              className="size-6 gap-0 rounded-full p-0 text-muted-foreground [&_svg]:size-6"
              variant="ghost"
            >
              <FilledCircleQuestion height={"28"} width={"28"} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent align="start">Help and Support</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side="top"
        align="start"
        className="min-w-52 -translate-x-1"
      >
        <Link href="/welcome" prefetch={false} target="_blank">
          <DropdownMenuItem>
            <HandWave />
            Welcome Steps
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link href="/support" prefetch={false} target="_blank">
          <DropdownMenuItem>
            <Search />
            Search for Help
          </DropdownMenuItem>
        </Link>
        <a href="mailto:support@churchspace.co">
          <DropdownMenuItem>
            <Email />
            Contact Support
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
