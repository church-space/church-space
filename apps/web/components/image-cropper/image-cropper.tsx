"use client";

import type React from "react";

import { Button } from "@church-space/ui/button";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { ImageIcon, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./utils";

export default function ProfileUploadModal() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFile = (file: File) => {
    // Check file size - 50MB maximum
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setError(
        `File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImage(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const showCroppedImage = useCallback(async () => {
    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        setImage(croppedImage);
        // Here you would typically upload the cropped image to your server
      }
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image]);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    await showCroppedImage();
    setOpen(false);
  };

  const resetState = () => {
    setImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) resetState();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload profile picture</DialogTitle>
            <DialogDescription>
              Upload and crop your profile picture. It will be displayed as a
              circle.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 px-4 py-2 text-destructive">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {!image ? (
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25",
                  "cursor-pointer",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-medium">Drag photo here</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    SVG, PNG, JPG or GIF (max. 50MB)
                  </p>
                  <Button size="sm" variant="secondary">
                    Select from computer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative h-64 w-full">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
            )}
            {image && (
              <div className="flex items-center justify-center">
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetState();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            {image && (
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
