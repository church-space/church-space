import { createClient } from "@church-space/supabase/client";

export interface Asset {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  path: string;
  created_at: string;
  size: number;
}

// Helper function to determine file type from extension
export const getFileType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "csv",
    "xlsm",
    "xlsb",
    "xltx",
    "xltm",
    "svg",
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

export async function fetchOrgAssets({
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
    const path = `${sanitizedOrgId}`;

    // Get the total count using the RPC function
    const { data: countData, error: countError } = await supabase.rpc(
      "count_direct_storage_items",
      { bucket_name: "organization-assets", folder_path: `${path}/` },
    );

    if (countError) {
      console.error("Count error:", countError);
      throw countError;
    }

    const totalCount = countData || 0;

    // Calculate pagination helper (will be applied _after_ all filtering)
    const offset = (currentPage - 1) * itemsPerPage;

    // ----------------------------
    // 1. Load files
    // ----------------------------
    // When a search query or custom filter is applied we need to inspect the *full* list
    // of files, otherwise we might exclude matching items that live on a different page.
    // If no query/filters are present we keep the efficient paginated fetch that was
    // already in place.

    let files: any[] = [];
    let filesError: any;

    const needsFullList =
      Boolean(searchQuery) || selectedType !== "all" || type === "image";

    if (needsFullList) {
      // Fetch everything in the folder (supabase caps this to 1000 items per call)
      const { data: allFiles, error: allFilesError } = await supabase.storage
        .from("organization-assets")
        .list(path, {
          sortBy: { column: "created_at", order: "desc" },
        });

      files = allFiles ?? [];
      filesError = allFilesError;
    } else {
      // Keep the original paginated fetch to minimise data transfer when no filters are active
      const resp = await supabase.storage
        .from("organization-assets")
        .list(path, {
          limit: itemsPerPage,
          offset: offset,
          sortBy: { column: "created_at", order: "desc" },
        });

      files = resp.data ?? [];
      filesError = resp.error;
    }

    if (filesError) {
      throw filesError;
    }

    // ----------------------------
    // 2. Filtering
    // ----------------------------
    let filteredFiles = files;

    // Filter by type if needed
    if (type === "image") {
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      filteredFiles = filteredFiles.filter((file: any) => {
        const extension: string =
          file.name.split(".").pop()?.toLowerCase() || "";
        return imageExtensions.includes(extension);
      });
    }

    // Additional filtering based on selected type in the dropdown
    if (selectedType !== "all") {
      filteredFiles = filteredFiles.filter((file: any) => {
        const fileType = getFileType(file.name);
        return fileType === selectedType;
      });
    }

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredFiles = filteredFiles.filter((file: any) =>
        file.name.toLowerCase().includes(query),
      );
    }

    // --------------------------------------
    // 3. Pagination AFTER filtering
    // --------------------------------------
    let paginatedFiles: any[] = [];
    let effectiveTotalCount = 0;

    if (needsFullList) {
      effectiveTotalCount = filteredFiles.length;
      paginatedFiles = filteredFiles.slice(offset, offset + itemsPerPage);
    } else {
      // We already fetched paginated results, so filteredFiles is the paginated set
      effectiveTotalCount = totalCount; // from DB / RPC
      paginatedFiles = filteredFiles;
    }

    // Get public URLs for each paginated file
    const assetsWithUrls = await Promise.all(
      paginatedFiles.map(async (file: any) => {
        const filePath = `${path}/${file.name}`;
        const fileType = getFileType(file.name);

        // Get the public URL
        const { data: publicUrlData } = await supabase.storage
          .from("organization-assets")
          .getPublicUrl(filePath);

        // Extract the original filename without timestamp
        const extension = file.name.split(".").pop() || "";
        const nameWithoutExtension = file.name.slice(
          0,
          -(extension.length + 1),
        );
        const lastUnderscoreIndex = nameWithoutExtension.lastIndexOf("_");
        const filenameWithoutTimestamp =
          lastUnderscoreIndex !== -1
            ? `${nameWithoutExtension.substring(0, lastUnderscoreIndex)}.${extension}`
            : file.name;

        return {
          id: file.id,
          title: filenameWithoutTimestamp,
          type: fileType,
          imageUrl: publicUrlData.publicUrl,
          path: filePath,
          created_at: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || undefined,
        } as Asset;
      }),
    );

    return {
      assets: assetsWithUrls,
      totalCount: effectiveTotalCount,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching organization assets:", error);
    return { assets: [], totalCount: 0, error: "An error occurred" };
  }
}
