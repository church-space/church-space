"use client";

import type React from "react";
import { Button } from "@church-space/ui/button";
import { Card, CardFooter } from "@church-space/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@church-space/ui/dialog";
import { LoaderIcon, Refresh } from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@church-space/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Search,
  X,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { fetchOrgAssets, type Asset } from "./fetch-org-assets";
import { Skeleton } from "@church-space/ui/skeleton";
import { useFileUpload } from "./use-file-upload";
import { getOrgStorageUsageAction } from "@/actions/get-org-storage-usage";
import { useQuery } from "@tanstack/react-query";

// Helper function to get icon based on file type
const FileTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "image":
      return <ImageIcon className="h-8 w-8" />;
    case "document":
      return <FileTextIcon className="h-8 w-8" />;
    default:
      return <FileIcon className="h-8 w-8" />;
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const AssetCard = ({
  asset,
  onSelect,
  onDelete,
}: {
  asset: Asset;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card
      key={asset.id}
      className="group relative w-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="absolute left-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 opacity-50 transition-opacity hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Asset</DialogTitle>
              <DialogDescription>
                This will permanently delete this asset. This action cannot be
                undone, and the asset will be removed from all places it is
                used.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <LoaderIcon height="16" width="16" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className="relative flex aspect-video items-center justify-center bg-muted"
        onClick={onSelect}
      >
        {asset.type === "image" ? (
          <Image
            src={asset.imageUrl}
            alt={asset.title}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              console.error("Image failed to load:", asset.imageUrl);
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.classList.add("flex");
                const iconContainer = document.createElement("div");
                iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                parent.appendChild(iconContainer);
              }
            }}
            width={112}
            height={112}
          />
        ) : (
          <FileTypeIcon type={asset.type} />
        )}
        <div className="absolute right-2 top-2 rounded-md bg-primary px-2 py-1 text-xs capitalize text-primary-foreground">
          {asset.type}
        </div>
      </div>
      <CardFooter className="p-3" onClick={onSelect}>
        <h3 className="w-full truncate text-sm font-medium">{asset.title}</h3>
        <p className="shrink-0 text-xs text-muted-foreground">
          {formatFileSize(asset.size)}
        </p>
      </CardFooter>
    </Card>
  );
};

export default function AssetBrowserModal({
  triggerText,
  buttonClassName,
  onSelectAsset,
  organizationId,
  type,
  setIsUploadModalOpen,
  handleDelete: externalHandleDelete,
  bucket,
}: {
  triggerText: string;
  buttonClassName: string;
  onSelectAsset: (asset: Asset) => void;
  organizationId: string;
  type?: "image" | "any";
  setIsUploadModalOpen?: (open: boolean) => void;
  handleDelete?: (asset: Asset) => void;
  bucket: "organization-assets";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { deleteFile } = useFileUpload(organizationId, bucket);

  const { data: orgStorageUsage } = useQuery({
    queryKey: ["orgStorageUsage"],
    queryFn: () => getOrgStorageUsageAction({ organizationId }),
  });

  const orgStorageUsageGB =
    orgStorageUsage?.data?.data != null
      ? (orgStorageUsage.data.data / 1024).toFixed(2)
      : "0.00";

  const itemsPerPage = 6;

  // Create a ref to store the latest search query for the debounced function
  const searchQueryRef = useRef(searchQuery);

  // Update the ref whenever searchQuery changes
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Create a debounced version of loadAssets
  const debouncedLoadAssets = useCallback(
    debounce(async () => {
      setLoading(true);
      setError(null);

      // TODO: use react query to fetch assets and cache the result
      try {
        const result = await fetchOrgAssets({
          organizationId,
          currentPage,
          itemsPerPage,
          searchQuery: searchQueryRef.current,
          selectedType,
          type,
        });

        setAssets(result.assets);
        setTotalCount(result.totalCount);
        setError(result.error);
      } catch (err) {
        console.error("Error loading assets:", err);
        setError("Failed to load assets. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300), // Reduced debounce time for faster response
    [organizationId, currentPage, selectedType, type],
  );

  // Fetch assets when dependencies change
  useEffect(() => {
    debouncedLoadAssets();
    // Cleanup
    return () => {
      debouncedLoadAssets.cancel();
    };
  }, [
    organizationId,
    currentPage,
    searchQuery,
    selectedType,
    debouncedLoadAssets,
  ]);

  // Reset to first page when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setCurrentPage(1);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleAssetDelete = async (asset: Asset) => {
    try {
      // Delete from storage
      await deleteFile(asset.path);

      // Update local state
      const updatedAssets = assets.filter((a) => a.id !== asset.id);
      setAssets(updatedAssets);
      setTotalCount((prev) => prev - 1);

      // Call external handler if provided
      externalHandleDelete?.(asset);
    } catch (error) {
      console.error("Failed to delete asset:", error);
      setError("Failed to delete asset. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName} variant="outline">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="top-20 flex h-full max-h-[620px] translate-y-0 flex-col justify-start overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-baseline gap-2">
            <DialogTitle className="text-xl font-bold">
              Asset Library
            </DialogTitle>
            {orgStorageUsageGB} GB / 30 GB used
          </div>
        </DialogHeader>

        <div className="h-flex-1 flex flex-col space-y-4">
          {/* Search and filter controls */}
          <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
                maxLength={150}
              />
            </div>

            {/* Only show type selector if type is not "image" */}
            {type !== "image" && (
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            )}

            {(searchQuery || selectedType !== "all") && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-[38px] px-2 text-orange-600"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              className="h-[38px] px-3"
              onClick={debouncedLoadAssets}
            >
              <Refresh />
            </Button>
            {setIsUploadModalOpen && (
              <Button
                variant="default"
                className="h-[38px] px-3"
                onClick={() => {
                  setIsUploadModalOpen(true);
                  setIsOpen(false);
                }}
              >
                Upload
              </Button>
            )}
          </div>

          {/* Asset grid */}
          <div className="min-h-[300px]">
            {" "}
            {/* Added min-height to prevent layout shift */}
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={index}
                      className="w-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                    >
                      <Skeleton className="relative aspect-video w-full rounded-b-none">
                        <div className="absolute right-2 top-2 h-6 w-12 animate-pulse rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"></div>
                      </Skeleton>
                      <CardFooter className="p-3">
                        <Skeleton className="h-5 w-[70%]" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-destructive">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={debouncedLoadAssets}
                >
                  Try Again
                </Button>
              </div>
            ) : assets.length > 0 ? (
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onSelect={() => {
                      onSelectAsset(asset);
                      setIsOpen(false);
                    }}
                    onDelete={() => handleAssetDelete(asset)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No assets found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination - always show if there are items to paginate */}
          {totalCount > itemsPerPage && (
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      !loading && setCurrentPage(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1 || loading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;

                  // Logic to show relevant page numbers
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => !loading && setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className={loading ? "pointer-events-none" : ""}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      !loading &&
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages || loading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
