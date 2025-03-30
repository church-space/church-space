"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define the type based on the SQL schema
export type LinkList = {
  id: number;
  created_at: string; // Use string for timestamp, can be formatted later
  is_public: boolean;
  url_slug: string;
  private_name: string; // Internal/private name
};

export const columns: ColumnDef<LinkList>[] = [
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
    accessorKey: "private_name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("private_name")}</div>;
    },
  },
  {
    accessorKey: "url_slug",
    header: "URL Slug",
    cell: ({ row }) => {
      const urlSlug = row.getValue("url_slug") as string;
      return (
        <Link href={`/link-lists/${row.original.id}`} prefetch={true}>
          /{urlSlug}
        </Link>
      );
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
