"use client";

import { Button } from "@church-space/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";

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
  bucket?: "organization-assets";
}

const FileUpload = ({
  organizationId,
  onUploadComplete,
  type = "any",
  initialFilePath = "",
  onRemove,
  bucket = "organization-assets",
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(initialFilePath);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
          if (
            error instanceof Error &&
            error.message === "STORAGE_LIMIT_EXCEEDED"
          ) {
            setErrorMessage(
              "Your organization's storage limit of 30GB has been reached. Please delete some existing assets before uploading new ones.",
            );
          } else {
            setErrorMessage("Failed to upload file. Please try again.");
          }
          setIsErrorDialogOpen(true);
          setIsModalOpen(false);
        } finally {
          setIsUploading(false);
          setIsSelectingFile(false);
        }
      } else if (selectedFile) {
        setErrorMessage("File size exceeds 50MB limit.");
        setIsErrorDialogOpen(true);
        setIsModalOpen(false);
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
      try {
        setIsUploading(true);
        const path = await uploadFile(droppedFile);
        setFile(droppedFile);
        setFilePath(path || "");
        setIsModalOpen(false);
        onUploadComplete?.(path || "");
      } catch (error) {
        console.error("Upload failed:", error);
        if (
          error instanceof Error &&
          error.message === "STORAGE_LIMIT_EXCEEDED"
        ) {
          setErrorMessage(
            "Your organization's storage limit of 30GB has been reached. Please delete some existing assets before uploading new ones.",
          );
        } else {
          setErrorMessage("Failed to upload file. Please try again.");
        }
        setIsErrorDialogOpen(true);
        setIsModalOpen(false);
      } finally {
        setIsUploading(false);
        setIsSelectingFile(false);
      }
    } else if (droppedFile) {
      setErrorMessage("File size exceeds 50MB limit.");
      setIsErrorDialogOpen(true);
      setIsModalOpen(false);
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
    if (file) {
      const extension = file.name.split(".").pop() || "";
      const nameWithoutExtension = file.name.slice(0, -(extension.length + 1));
      const lastUnderscoreIndex = nameWithoutExtension.lastIndexOf("_");
      const filenameWithoutTimestamp =
        lastUnderscoreIndex !== -1
          ? nameWithoutExtension.substring(0, lastUnderscoreIndex)
          : nameWithoutExtension;
      return `${filenameWithoutTimestamp}.${extension}`;
    }
    if (filePath) {
      // Extract filename from path
      const pathParts = filePath.split("/");
      const filename = pathParts[pathParts.length - 1];
      const extension = filename.split(".").pop() || "";
      const nameWithoutExtension = filename.slice(0, -(extension.length + 1));
      const lastUnderscoreIndex = nameWithoutExtension.lastIndexOf("_");
      return lastUnderscoreIndex !== -1
        ? `${nameWithoutExtension.substring(0, lastUnderscoreIndex)}.${extension}`
        : filename;
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
      <div className="flex min-w-0 flex-1">
        {!file && !filePath && (
          <AssetBrowserModal
            triggerText="Browse"
            buttonClassName="flex-1 rounded-r-none border-r-0 truncate"
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
          {!file && !filePath ? (
            <DialogTrigger asChild>
              <Button
                className="justify-start rounded-l-none bg-background pl-3 font-normal"
                variant="outline"
                disabled={isUploading || isDeleting}
              >
                <div className="flex items-center">
                  <CloudUpload />
                </div>
              </Button>
            </DialogTrigger>
          ) : null}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Assets you upload are visible to the public web for anyone with
                a link. Please ensure anything you upload is not sensitive
                information.
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
            {errorMessage && (
              <div className="mt-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">Max file size: 50MB</p>
          </DialogContent>
        </Dialog>

        {(file || filePath) && (
          <AssetBrowserModal
            triggerText={getDisplayName() || ""}
            buttonClassName="flex-1 rounded-r-none justify-start bg-background pl-3 font-normal truncate max-w-full"
            onSelectAsset={handleAssetSelect}
            organizationId={organizationId}
            type={type}
            setIsUploadModalOpen={setIsModalOpen}
            handleDelete={handleDelete}
            bucket={bucket}
          />
        )}
      </div>

      {(file || filePath) && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove file</p>
            </TooltipContent>
          </Tooltip>

          {/* Error Dialog */}
          <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Error</DialogTitle>
                <DialogDescription className="text-destructive">
                  {errorMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setIsErrorDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
