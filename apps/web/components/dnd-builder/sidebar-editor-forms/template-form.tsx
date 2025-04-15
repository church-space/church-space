"use client";

import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Trash } from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import { useState, useRef } from "react";
import { cn } from "@church-space/ui/cn";

export default function TemplateForm({
  name,
  id,
  onDelete,
  onNameChange,
}: {
  name: string;
  id: number;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [localName, setLocalName] = useState(name);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNameChange = (value: string) => {
    setLocalName(value);
    setNameError(null);

    if (nameTimerRef.current) {
      clearTimeout(nameTimerRef.current);
    }

    nameTimerRef.current = setTimeout(() => {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        setNameError("Template name cannot be empty.");
      } else {
        onNameChange(trimmedValue);
      }
    }, 800);
  };

  return (
    <div className="mt-8 flex flex-col gap-4 border-t px-1 pt-4">
      <div className="flex items-center justify-between">
        <div className="text-md font-medium">Template Settings</div>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-destructive/30 hover:text-destructive"
                >
                  <Trash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Template</TooltipContent>
            </Tooltip>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this template? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          placeholder="Template Name"
          className={cn("bg-background", nameError && "border-destructive")}
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "name-error" : undefined}
          maxLength={80}
        />
        {nameError && (
          <p id="name-error" className="text-xs text-destructive">
            {nameError}
          </p>
        )}
      </div>
    </div>
  );
}
