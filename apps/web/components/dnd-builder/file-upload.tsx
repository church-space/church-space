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
  DialogFooter,
  DialogClose,
} from "@trivo/ui/dialog";
import { Label } from "@trivo/ui/label";
import { XIcon, LoaderIcon } from "@trivo/ui/icons";
import type React from "react";
import { useState, useEffect } from "react";
import { useFileUpload } from "./use-file-upload";

interface FileUploadProps {
  organizationId: string;
  onUploadComplete?: (path: string) => void;
  type?: "image" | "any";
  initialFilePath?: string;
  onRemove?: () => void;
}

const FileUpload = ({
  organizationId,
  onUploadComplete,
  type = "any",
  initialFilePath = "",
  onRemove,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(initialFilePath);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { uploadFile, deleteFile } = useFileUpload(organizationId);

  // Update filePath when initialFilePath changes
  useEffect(() => {
    setFilePath(initialFilePath);
  }, [initialFilePath]);

  const handleUpload = async (selectedFile: File) => {
    try {
      setIsUploading(true);
      const path = await uploadFile(selectedFile);
      setFile(selectedFile);
      setFilePath(path || "");
      setIsModalOpen(false);
      onUploadComplete?.(path || "");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.size <= 50 * 1024 * 1024) {
      await handleUpload(selectedFile);
    } else {
      alert("File size exceeds 50MB limit.");
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 50 * 1024 * 1024) {
      await handleUpload(droppedFile);
    } else {
      alert("File size exceeds 50MB limit.");
    }
  };

  const handleDelete = async () => {
    if (!filePath) {
      setFile(null);
      onUploadComplete?.("");
      onRemove?.();
      return;
    }

    try {
      setIsDeleting(true);
      await deleteFile(filePath);
      setFile(null);
      setFilePath("");
      onUploadComplete?.("");
      onRemove?.();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Extract filename from path for display
  const getDisplayName = () => {
    if (file) return file.name;
    if (filePath) {
      // Extract filename from path
      const pathParts = filePath.split("/");
      return pathParts[pathParts.length - 1];
    }
    return "Upload File";
  };

  return (
    <div className="flex items-center col-span-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            className={cn(
              "w-full bg-transparent justify-start px-3 font-normal truncate",
              file || filePath ? "rounded-r-none" : "text-muted-foreground"
            )}
            variant="outline"
            disabled={isUploading || isDeleting}
          >
            {getDisplayName()}
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
          <div className="relative">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
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
                accept={type === "image" ? "image/*" : "*/*"}
              />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin">
                    <LoaderIcon height="44" width="44" />
                  </div>
                  <span className="text-sm">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">Max file size: 50MB</p>
        </DialogContent>
      </Dialog>

      {(file || filePath) && (
        <>
          <Button
            variant="outline"
            className="rounded-l-none border-l-0 bg-transparent hover:text-destructive"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <XIcon />
            <span className="sr-only">Delete file</span>
          </Button>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this file? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">
                        <LoaderIcon height="16" width="16" />
                      </div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default FileUpload;
