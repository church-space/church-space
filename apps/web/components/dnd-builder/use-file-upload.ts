import { createClient } from "@trivo/supabase/client";
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

      const { data, error } = await supabase.storage
        .from("email_assets")
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      return data.path;
    },
    [organizationId, supabase]
  );

  return { uploadFile };
};
