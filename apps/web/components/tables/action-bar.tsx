import { Button } from "@church-space/ui/button";
import { XIcon } from "@church-space/ui/icons";
import { Separator } from "@church-space/ui/separator";
import React from "react";

interface ActionBarProps {
  onDeselectAll: () => void;
}

export default function ActionBar({ onDeselectAll }: ActionBarProps) {
  return (
    <div className="flex h-12 w-fit items-center rounded-lg border bg-background px-3 shadow-md">
      <Button
        variant="outline"
        className="h-8 gap-1 border-dashed pr-2 text-muted-foreground"
        onClick={onDeselectAll}
      >
        Deselect All
        <Separator orientation="vertical" className="ml-3 mr-1 h-8" />
        <XIcon />
      </Button>
    </div>
  );
}
