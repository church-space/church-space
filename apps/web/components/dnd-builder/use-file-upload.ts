import { createClient } from "@church-space/supabase/client";
import { useCallback } from "react";

// Helper function to compress images
const compressImage = async (
  file: File,
  maxSizeKB: number = 200
): Promise<File> => {
  // Only compress image files
  if (!file.type.startsWith("image/")) {
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
        let quality = 0.9;
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

export const useFileUpload = (organizationId: string) => {
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return null;

      // Compress the file if it's an image
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        try {
          fileToUpload = await compressImage(file);
          console.log(
            `Compressed image from ${(file.size / 1024).toFixed(2)}KB to ${(fileToUpload.size / 1024).toFixed(2)}KB`
          );
        } catch (error) {
          console.error("Image compression failed:", error);
          // Continue with the original file if compression fails
        }
      }

      // Add timestamp to filename to make it unique
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileExtension = file.name.split(".").pop();
      const fileName = `${file.name.split(".")[0]}_${timestamp}.${fileExtension}`;

      // Create the full path including organization folder
      const filePath = `unsent/${organizationId}/${fileName}`;

      // Implement retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase.storage
            .from("email_assets")
            .upload(filePath, fileToUpload);

          if (error) {
            console.error(`Upload attempt ${attempts + 1} failed:`, error);
            attempts++;

            if (attempts >= maxAttempts) {
              throw error;
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts))
            );
            continue;
          }

          return data.path;
        } catch (error) {
          console.error(`Upload attempt ${attempts + 1} exception:`, error);
          attempts++;

          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts))
          );
        }
      }

      throw new Error("Upload failed after multiple attempts");
    },
    [organizationId, supabase]
  );

  const deleteFile = useCallback(
    async (filePath: string) => {
      if (!filePath) return false;

      const { error } = await supabase.storage
        .from("email_assets")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        throw error;
      }

      return true;
    },
    [supabase]
  );

  return { uploadFile, deleteFile };
};
