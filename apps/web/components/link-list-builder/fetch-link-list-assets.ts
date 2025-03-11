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

export async function fetchLinkListAssets({
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

    // Get the total count using the RPC function
    const { data: countData, error: countError } = await supabase.rpc(
      "count_direct_storage_items",
      { bucket_name: "link_list_assets", folder_path: `${path}/` },
    );

    console.log("countData", countData);

    if (countError) {
      console.error("Count error:", countError);
      throw countError;
    }

    const totalCount = countData || 0;

    // Calculate pagination
    const offset = (currentPage - 1) * itemsPerPage;

    // Fetch only the files for the current page
    const { data: files, error: filesError } = await supabase.storage
      .from("link_list_assets")
      .list(path, {
        limit: itemsPerPage,
        offset: offset,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (filesError) {
      throw filesError;
    }

    // Apply filters to the paginated results
    let filteredFiles = files || [];

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
        file.name.toLowerCase().includes(query),
      );
    }

    // Get public URLs for each file
    const assetsWithUrls = await Promise.all(
      filteredFiles.map(async (file) => {
        const filePath = `${path}/${file.name}`;
        const fileType = getFileType(file.name);

        // Get the public URL
        const { data: publicUrlData } = await supabase.storage
          .from("link_list_assets")
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
      }),
    );

    return {
      assets: assetsWithUrls,
      totalCount: totalCount,
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
