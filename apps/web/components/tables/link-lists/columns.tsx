"use client";

import { Badge } from "@church-space/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

// Define the type based on the SQL schema
export type LinkList = {
  id: number;
  created_at: string;
  private_name: string | null;
  is_public: boolean;
  url_slug: string | null;
};

export const columns: ColumnDef<LinkList>[] = [
  {
    accessorKey: "private_name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("private_name") as string | null;
      return (
        <Link href={`/link-pages/${row.original.id}`} prefetch={true}>
          <div className="min-w-32 truncate text-base font-semibold hover:underline">
            {name || "Untitled"}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "url_slug",
    header: "URL",
    cell: ({ row }) => {
      const urlSlug = row.getValue("url_slug") as string | null;
      return urlSlug ? (
        <Link
          className="flex items-center gap-1 hover:underline"
          href={`https://churchspace.co/links/${urlSlug}`}
          prefetch={false}
          target="_blank"
        >
          <span className="font-light text-muted-foreground">
            https://churchspace.co/links/
          </span>
          <span className="truncate font-medium">{urlSlug}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      ) : (
        <span className="text-muted-foreground">No URL</span>
      );
    },
  },
  {
    accessorKey: "is_public",
    header: "Visibility",
    cell: ({ row }) => {
      const isPublic = row.getValue("is_public") as boolean;
      return (
        <Badge variant={isPublic ? "default" : "secondary"} className="w-fit">
          {isPublic ? "Public" : "Private"}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
      enumValues: ["true", "false"],
    },
    filterFn: (row, id, filterValue) => {
      if (filterValue === "all") return true;
      const value = row.getValue(id) as boolean;
      return value === (filterValue === "true");
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
