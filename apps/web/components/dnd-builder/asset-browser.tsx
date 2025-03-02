"use client";

import type React from "react";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@church-space/ui/button";
import { Card, CardFooter } from "@church-space/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Input } from "@church-space/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@church-space/ui/pagination";
import { useQueryState } from "nuqs";
import { CloudUpload } from "@church-space/ui/icons";

interface Asset {
  id: number;
  title: string;
  type: string;
  imageUrl: string;
}

// Sample asset data
const assetData = [
  {
    id: 1,
    title: "Product Photography",
    type: "image",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 2,
    title: "Company Introduction",
    type: "video",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 3,
    title: "Annual Report 2023",
    type: "document",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 4,
    title: "Team Meeting",
    type: "video",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 5,
    title: "Brand Guidelines",
    type: "document",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 6,
    title: "Product Showcase",
    type: "image",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 7,
    title: "Customer Testimonial",
    type: "video",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 8,
    title: "Project Proposal",
    type: "document",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 9,
    title: "Office Space",
    type: "image",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 10,
    title: "Marketing Strategy",
    type: "document",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 11,
    title: "Product Demo",
    type: "video",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 12,
    title: "Team Photos",
    type: "image",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 13,
    title: "Sales Presentation",
    type: "document",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 14,
    title: "Tutorial Video",
    type: "video",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
  {
    id: 15,
    title: "Event Banner",
    type: "image",
    imageUrl: "/placeholder.svg?height=180&width=320",
  },
];

export default function AssetBrowserModal({
  triggerText,
  buttonClassName,
  onSelectAsset,
  modalName,
}: {
  triggerText: string;
  buttonClassName: string;
  onSelectAsset: (asset: Asset) => void;
  modalName: string;
}) {
  const [open, setOpen] = useQueryState(modalName);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useQueryState(
    `${modalName}-currentPage`
  );
  const currentPageNumber = currentPage ? parseInt(currentPage, 10) : 1;

  const itemsPerPage = 6;

  // Filter assets based on search query and selected type
  const filteredAssets = assetData.filter((asset) => {
    const matchesSearch = asset.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPageNumber - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage("1");
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage("1");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setCurrentPage("1");
  };

  return (
    <Dialog
      open={open === "true"}
      onOpenChange={(isOpen) => {
        setOpen(isOpen ? "true" : "false");
        if (!isOpen) {
          setCurrentPage("1");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className={buttonClassName} variant="outline">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Asset Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || selectedType !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Asset grid */}
          {paginatedAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="overflow-hidden"
                  onClick={() => onSelectAsset(asset)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={asset.imageUrl || "/placeholder.svg"}
                      alt={asset.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                      {asset.type}
                    </div>
                  </div>
                  <CardFooter className="p-3">
                    <h3 className="font-medium text-sm truncate">
                      {asset.title}
                    </h3>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No assets found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {filteredAssets.length > itemsPerPage && (
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage(
                        Math.max(1, currentPageNumber - 1).toString()
                      )
                    }
                    className={
                      currentPageNumber === 1
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
                  } else if (currentPageNumber <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPageNumber >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPageNumber - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber.toString())}
                        isActive={currentPageNumber === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPageNumber < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(
                        Math.min(totalPages, currentPageNumber + 1).toString()
                      )
                    }
                    className={
                      currentPageNumber === totalPages
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
