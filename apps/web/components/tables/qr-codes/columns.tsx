"use client";

import { Badge } from "@church-space/ui/badge";
import { Checkbox } from "@church-space/ui/checkbox";
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

export const columns: ColumnDef<QrLink>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="opacity-0 transition-opacity group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link href={`/qr-codes/${row.original.id}`} prefetch={true}>
          {row.getValue("name")}
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
          {/* Display a shortened or relevant part of the URL if needed */}
          {url.length > 50 ? `${url.substring(0, 50)}...` : url}
          <ExternalLinkIcon className="ml-1 inline-block h-3 w-3" />
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      // Format the date as needed, e.g., MM/DD/YYYY
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
