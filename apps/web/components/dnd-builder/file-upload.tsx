"use client";

import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@church-space/ui/dialog";
import { Label } from "@church-space/ui/label";
import { XIcon, LoaderIcon } from "@church-space/ui/icons";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFileUpload } from "./use-file-upload";
import AssetBrowserModal from "./asset-browser";
import { CloudUpload } from "@church-space/ui/icons";

// Add a debounce utility function
const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

interface FileUploadProps {
  organizationId: string;
  onUploadComplete?: (path: string) => void;
  type?: "image" | "any";
  initialFilePath?: string;
  onRemove?: () => void;
  bucket?: "email_assets" | "link_list_assets";
}

const FileUpload = ({
  organizationId,
  onUploadComplete,
  type = "any",
  initialFilePath = "",
  onRemove,
  bucket = "email_assets",
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(initialFilePath);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastClickTime = useRef<number>(0);
  const { uploadFile, deleteFile } = useFileUpload(organizationId, bucket);

  // Update filePath when initialFilePath changes
  useEffect(() => {
    setFilePath(initialFilePath);
  }, [initialFilePath]);

  // Create a separate file input outside the dialog
  useEffect(() => {
    // Create a new file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === "image" ? "image/*" : "*/*";
    fileInput.style.display = "none";

    // Add event listener for file selection
    fileInput.addEventListener("change", async (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];

      if (selectedFile && selectedFile.size <= 50 * 1024 * 1024) {
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
          setIsSelectingFile(false);
        }
      } else if (selectedFile) {
        alert("File size exceeds 50MB limit.");
      }

      // Reset the input value
      fileInput.value = "";
      setIsSelectingFile(false);
    });

    // Store reference to the file input
    fileInputRef.current = fileInput;

    // Append to body
    document.body.appendChild(fileInput);

    // Clean up on unmount
    return () => {
      document.body.removeChild(fileInput);
    };
  }, [type, uploadFile, onUploadComplete]);

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
      setIsSelectingFile(false);
    }
  };

  // Debounced click handler to prevent multiple clicks
  const handleClickUpload = useCallback(
    debounce(() => {
      // Prevent multiple file dialogs from opening
      if (isUploading || isSelectingFile) return;

      // Prevent rapid clicks
      const now = Date.now();
      if (now - lastClickTime.current < 1000) return;
      lastClickTime.current = now;

      // Set flag to indicate we're in the process of selecting a file
      setIsSelectingFile(true);

      // Click the file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 300),
    [isUploading, isSelectingFile],
  );

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // Prevent handling if already uploading or selecting
    if (isUploading || isSelectingFile) return;

    setIsSelectingFile(true);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 50 * 1024 * 1024) {
      await handleUpload(droppedFile);
    } else {
      alert("File size exceeds 50MB limit.");
      setIsSelectingFile(false);
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

  const handleRemove = async () => {
    if (!filePath) {
      setFile(null);
      onUploadComplete?.("");
      onRemove?.();
      return;
    }

    try {
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
    return null; // Return null when there's no file
  };

  const handleAssetSelect = (asset: { imageUrl: string; path: string }) => {
    // Use the path directly if available, otherwise extract from imageUrl
    const path =
      asset.path ||
      (asset.imageUrl.includes(bucket + "/")
        ? asset.imageUrl.split(bucket + "/")[1]
        : "");

    if (path) {
      setFilePath(path);
      onUploadComplete?.(path);
    }
  };

  return (
    <div className="col-span-2 flex w-full items-center">
      <div className="flex w-full flex-1">
        {!file && !filePath && (
          <AssetBrowserModal
            triggerText="Browse"
            buttonClassName="flex-1 rounded-r-none border-r-0"
            onSelectAsset={handleAssetSelect}
            organizationId={organizationId}
            type={type}
            setIsUploadModalOpen={setIsModalOpen}
            handleDelete={handleDelete}
            bucket={bucket}
          />
        )}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setIsSelectingFile(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className={cn(
                "justify-start bg-transparent px-3 font-normal",
                file || filePath ? "rounded-r-none" : "rounded-l-none",
              )}
              variant="outline"
              disabled={isUploading || isDeleting}
            >
              {getDisplayName() ? (
                <span className="block w-full max-w-[180px] overflow-hidden truncate text-ellipsis">
                  {getDisplayName()}
                </span>
              ) : (
                <div className="flex items-center">
                  <CloudUpload />
                </div>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                {bucket === "email_assets"
                  ? "Email assets will become public once sent. Please ensure anything you email is not sensitive information."
                  : "Link list assets are visible to the public web. Please ensure anything you upload is not sensitive information."}
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleClickUpload}
              >
                <Label htmlFor="fileInput" className="cursor-pointer">
                  Drop your file here or click to select
                </Label>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin">
                      <LoaderIcon height="44" width="44" />
                    </div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">Max file size: 50MB</p>
          </DialogContent>
        </Dialog>
      </div>

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
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this file from the block? You
                  can add it again from your file library if you change your
                  mind.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">
                        <LoaderIcon height="16" width="16" />
                      </div>
                      <span>Removing...</span>
                    </div>
                  ) : (
                    "Remove"
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
