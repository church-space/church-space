import { createClient } from "@church-space/supabase/client";

export const useCsvUpload = () => {
  const uploadCsv = async (file: File, organizationId: string) => {
    const supabase = createClient();

    // Generate a unique filename with timestamp and random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `import_${timestamp}_${randomString}.csv`;
    // Organization ID must be the first part of the path for RLS policies
    const filePath = `organizations/${organizationId}/${fileName}`;

    console.log("filePath", filePath);
    console.log("file", file);
    console.log("organizationId", organizationId);

    // Upload the file to the unsubscribe-csvs bucket
    const { error: uploadError } = await supabase.storage
      .from("unsubscribe-csvs")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload CSV: ${uploadError.message}`);
    }

    // Get a signed URL that expires in 1 week
    const { data: urlData, error: urlError } = await supabase.storage
      .from("unsubscribe-csvs")
      .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days in seconds

    if (urlError) {
      throw new Error(`Failed to generate signed URL: ${urlError.message}`);
    }

    return urlData.signedUrl;
  };

  return { uploadCsv };
};
