"use client";

import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

// Define the type based on the SQL schema
export type QrLink = {
  id: number;
  created_at: string; // Use string for timestamp, can be formatted later
  organization_id: string; // Assuming uuid is represented as string
  url: string | null;
  name: string | null;
  status: "active" | "inactive"; // Based on the check constraint
};

const currentYear = new Date().getFullYear();

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  };
  if (dateYear !== currentYear) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-US", options);
};

export const columns: ColumnDef<QrLink>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link href={`/qr-codes/${row.original.id}`} prefetch={true}>
          <Button
            variant="ghost"
            className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
          >
            {row.getValue("name")}
          </Button>
        </Link>
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.getValue("url") as string | null;
      if (!url) return "-";
      return (
        <Link
          href={url}
          target="_blank"
          className="flex items-center gap-1 hover:underline"
        >
          <div className="min-w-32 truncate hover:underline">
            {/* Display a shortened or relevant part of the URL if needed */}
            {url.length > 50 ? `${url.substring(0, 50)}...` : url}
            <ExternalLinkIcon className="ml-1 inline-block h-3 w-3" />
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as QrLink["status"];
      return (
        <Badge
          variant={status === "active" ? "success" : "outline"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      return <span>{formatDate(row.getValue("updated_at"))}</span>;
    },
  },
];
