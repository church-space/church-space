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
} from "@church-space/ui/dialog";
import { LoaderIcon } from "@church-space/ui/icons";
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
import { FileIcon, FileTextIcon, ImageIcon, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchEmailAssets,
  type Asset,
  getFileType,
} from "./fetch-email-assets";
import { Skeleton } from "@church-space/ui/skeleton";

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

export default function AssetBrowserModal({
  triggerText,
  buttonClassName,
  onSelectAsset,
  organizationId,
  type,
}: {
  triggerText: string;
  buttonClassName: string;
  onSelectAsset: (asset: Asset) => void;
  organizationId: string;
  type?: "image" | "any";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 6;

  // Fetch assets
  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    const result = await fetchEmailAssets({
      organizationId,
      currentPage,
      itemsPerPage,
      searchQuery,
      selectedType,
      type,
    });

    setAssets(result.assets);
    setTotalCount(result.totalCount);
    setError(result.error);
    setLoading(false);
  };

  // Fetch assets when the modal opens, organizationId changes, or search/page changes
  useEffect(() => {
    loadAssets();
  }, [organizationId, currentPage, searchQuery, selectedType]);

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName} variant="outline">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[620px] h-full overflow-y-auto top-20 translate-y-0 justify-start flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Asset Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 h-flex-1">
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-1.5 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
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
                size="sm"
                onClick={clearFilters}
                className="h-9 px-2 text-orange-600"
              >
                <X className="h-4 w-4 " />
                Clear
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center ">
              <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="w-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <Skeleton className="w-full aspect-video rounded-b-none relative">
                      <div className="absolute top-2 right-2 h-6 w-12 bg-primary text-primary-foreground text-xs px-2 py-1 animate-pulse rounded-md"></div>
                    </Skeleton>
                    <CardFooter className="p-3">
                      <Skeleton className="w-[70%] h-4" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={loadAssets}>
                Try Again
              </Button>
            </div>
          )}

          {/* Asset grid */}
          {!loading && !error && assets.length > 0 ? (
            <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card
                  key={asset.id}
                  className="w-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectAsset(asset)}
                >
                  <div className="aspect-video relative bg-muted flex items-center justify-center">
                    {asset.type === "image" ? (
                      <img
                        src={asset.imageUrl}
                        alt={asset.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            asset.imageUrl
                          );
                          // If image fails to load, show the file type icon
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.classList.add("flex");
                            const iconContainer = document.createElement("div");
                            iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                            parent.appendChild(iconContainer);
                          }
                        }}
                      />
                    ) : (
                      <FileTypeIcon type={asset.type} />
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md capitalize">
                      {asset.type}
                    </div>
                  </div>
                  <CardFooter className="p-3">
                    <h3 className="font-medium text-sm truncate w-full">
                      {asset.title}
                    </h3>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-8 text-muted-foreground">
              No assets found matching your criteria.
            </div>
          ) : null}

          {/* Pagination */}
          {!loading && !error && totalCount > itemsPerPage && (
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
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
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
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
