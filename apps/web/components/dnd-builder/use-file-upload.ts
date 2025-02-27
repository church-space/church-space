import { createClient } from "@church-space/supabase/client";
import { useCallback } from "react";

export const useFileUpload = (organizationId: string) => {
  const supabase = createClient();

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return null;

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
            .upload(filePath, file);

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
