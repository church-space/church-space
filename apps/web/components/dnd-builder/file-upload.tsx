"use client";

import { Button } from "@trivo/ui/button";
import { cn } from "@trivo/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@trivo/ui/dialog";
import { Label } from "@trivo/ui/label";
import { XIcon } from "@trivo/ui/icons";
import type React from "react";
import { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.size <= 50 * 1024 * 1024) {
      // 50MB in bytes
      setFile(selectedFile);
      setIsModalOpen(false);
    } else {
      alert("File size exceeds 50MB limit.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 50 * 1024 * 1024) {
      // 50MB in bytes
      setFile(droppedFile);
      setIsModalOpen(false);
    } else {
      alert("File size exceeds 50MB limit.");
    }
  };

  const handleDelete = () => {
    setFile(null);
  };

  return (
    <div className="flex items-center col-span-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            className={cn(
              "w-full bg-transparent justify-start px-3 font-normal",
              file ? "rounded-r-none" : "text-muted-foreground"
            )}
            variant="outline"
          >
            {file ? file.name : "Upload File"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Email assets will become public once sent. Please ensure anything
              you email is not sensitive information.
            </DialogDescription>
          </DialogHeader>
          <div
            className="border-2 border-dashed  rounded-lg p-8 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <Label htmlFor="fileInput" className="cursor-pointer">
              Drop your file here or click to select
            </Label>
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="*/*"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Max file size: 50MB</p>
        </DialogContent>
      </Dialog>
      {file && (
        <Button
          variant="outline"
          className="rounded-l-none border-l-0 bg-transparent hover:text-destructive"
          size="icon"
          onClick={handleDelete}
        >
          <XIcon />
          <span className="sr-only">Delete file</span>
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
