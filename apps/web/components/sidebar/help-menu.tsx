import { Button } from "@church-space/ui/button";
import {
  Email,
  FilledCircleQuestion,
  HandWave,
  LifeRing,
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
import { cn } from "@church-space/ui/cn";

export default function HelpMenu({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild className={cn("hidden md:block", className)}>
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
        <Link href="/welcome" prefetch={false}>
          <DropdownMenuItem>
            <HandWave />
            Welcome Steps
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link
          href="https://help.churchspace.co"
          prefetch={false}
          target="_blank"
        >
          <DropdownMenuItem>
            <LifeRing />
            Help Center
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
