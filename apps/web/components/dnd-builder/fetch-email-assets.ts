import { createClient } from "@church-space/supabase/client";

export interface Asset {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  path: string;
  created_at: string;
}

// Helper function to determine file type from extension
export const getFileType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
  ];

  if (imageExtensions.includes(extension)) return "image";
  if (documentExtensions.includes(extension)) return "document";

  return "other";
};

interface FetchAssetsOptions {
  organizationId: string;
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  selectedType?: string;
  type?: "image" | "any";
}

interface FetchAssetsResult {
  assets: Asset[];
  totalCount: number;
  error: string | null;
}

export async function fetchEmailAssets({
  organizationId,
  currentPage,
  itemsPerPage,
  searchQuery = "",
  selectedType = "all",
  type,
}: FetchAssetsOptions): Promise<FetchAssetsResult> {
  if (!organizationId) {
    return { assets: [], totalCount: 0, error: "Organization ID is required" };
  }

  const supabase = createClient();

  try {
    const sanitizedOrgId = organizationId.replace(/\s+/g, "");
    const path = `unsent/${sanitizedOrgId}`;

    // First, get the total count of files to properly handle pagination
    const { data: allFiles, error: countError } = await supabase.storage
      .from("email_assets")
      .list(path);

    if (countError) {
      throw countError;
    }

    // Filter by type and search query
    let filteredFiles = allFiles || [];

    // Filter by type if needed
    if (type === "image") {
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
      filteredFiles = filteredFiles.filter((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        return imageExtensions.includes(extension);
      });
    }

    // Additional filtering based on selected type in the dropdown
    if (selectedType !== "all") {
      filteredFiles = filteredFiles.filter((file) => {
        const fileType = getFileType(file.name);
        return fileType === selectedType;
      });
    }

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredFiles = filteredFiles.filter((file) =>
        file.name.toLowerCase().includes(query)
      );
    }

    // Sort by newest first (using created_at)
    filteredFiles.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Calculate pagination parameters
    const from = (currentPage - 1) * itemsPerPage;
    const to = Math.min(from + itemsPerPage, filteredFiles.length);

    // Get the paginated subset
    const paginatedFiles = filteredFiles.slice(from, to);

    // Get public URLs for each file
    const assetsWithUrls = await Promise.all(
      paginatedFiles.map(async (file) => {
        const filePath = `${path}/${file.name}`;
        const fileType = getFileType(file.name);

        // Get the public URL
        const { data: publicUrlData } = await supabase.storage
          .from("email_assets")
          .getPublicUrl(filePath);

        // Extract the original filename without timestamp
        const filenameWithoutTimestamp = file.name.split("_")[0] || file.name;

        return {
          id: file.id,
          title: filenameWithoutTimestamp,
          type: fileType,
          imageUrl: publicUrlData.publicUrl,
          path: filePath,
          created_at: file.created_at || new Date().toISOString(),
        };
      })
    );

    return {
      assets: assetsWithUrls,
      totalCount: filteredFiles.length,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching assets:", err);
    return {
      assets: [],
      totalCount: 0,
      error: "Failed to load assets. Please try again.",
    };
  }
}
