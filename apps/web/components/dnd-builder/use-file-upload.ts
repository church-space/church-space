import { createClient } from "@church-space/supabase/client";
import { useCallback } from "react";

// Helper function to compress images
const compressImage = async (
  file: File,
  maxSizeKB: number = 200,
): Promise<File> => {
  // Only compress image files, but skip GIFs
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate the ratio to maintain aspect ratio
        let ratio = 1;

        // Start with a high quality
        const quality = 0.9;
        const maxSize = maxSizeKB * 1024; // Convert KB to bytes

        // If the image is very large, resize it first
        if (width > 1600 || height > 1600) {
          ratio = Math.min(1600 / width, 1600 / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Use a recursive function to find the right quality level
        const compressWithQuality = (currentQuality: number): void => {
          // Get the data URL with the current quality
          const dataUrl = canvas.toDataURL(file.type, currentQuality);

          // Convert data URL to Blob
          const byteString = atob(dataUrl.split(",")[1]);
          const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);

          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: mimeString });

          // Check if the size is small enough
          if (blob.size <= maxSize || currentQuality <= 0.1) {
            // Create a new File from the compressed Blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });

            resolve(compressedFile);
          } else {
            // Reduce quality and try again
            compressWithQuality(currentQuality - 0.1);
          }
        };

        compressWithQuality(quality);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};

const isStorageLimitError = (error: any) => {
  return (
    error?.message === "new row violates row-level security policy" &&
    error?.statusCode === "403"
  );
};

export const useFileUpload = (
  organizationId: string,
  bucket: "organization-assets",
) => {
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return null;

      // Compress the file if it's an image
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        try {
          fileToUpload = await compressImage(file);
        } catch (error) {
          console.error("Image compression failed:", error);
          // Continue with the original file if compression fails
        }
      }

      // Add timestamp to filename to make it unique
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileExtension = file.name.split(".").pop();
      // Remove spaces from the file name
      const fileNameWithoutSpaces = file.name.split(".")[0].replace(/\s+/g, "");
      const fileName = `${fileNameWithoutSpaces}_${timestamp}.${fileExtension}`;

      // Create the full path including organization folder, ensuring no spaces
      const sanitizedOrgId = organizationId.replace(/\s+/g, "");
      const filePath = `${sanitizedOrgId}/${fileName}`;

      // Implement retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileToUpload);

          if (error) {
            if (isStorageLimitError(error)) {
              throw new Error("STORAGE_LIMIT_EXCEEDED");
            }

            console.error(`Upload attempt ${attempts + 1} failed:`, error);
            attempts++;

            if (attempts >= maxAttempts) {
              throw error;
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts)),
            );
            continue;
          }

          return data.path;
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "STORAGE_LIMIT_EXCEEDED"
          ) {
            throw error;
          }

          console.error(`Upload attempt ${attempts + 1} exception:`, error);
          attempts++;

          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts)),
          );
        }
      }

      throw new Error("Upload failed after multiple attempts");
    },
    [organizationId, supabase, bucket],
  );

  const deleteFile = useCallback(
    async (filePath: string) => {
      if (!filePath) return false;

      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        throw error;
      }

      return true;
    },
    [supabase, bucket],
  );

  return { uploadFile, deleteFile };
};
