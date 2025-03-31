"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

// Define the type based on the SQL schema
export type EmailCategory = {
  id: number;
  created_at: string;
  pco_name: string | null;
  pco_id: string | null;
  is_public: boolean;
  description: string | null;
};

export const columns: ColumnDef<EmailCategory>[] = [
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
    accessorKey: "pco_name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("pco_name") as string | null;
      return <div className="font-medium">{name || "Untitled"}</div>;
    },
  },
  {
    accessorKey: "pco_id",
    header: "PCO ID",
    cell: ({ row }) => {
      const pcoId = row.getValue("pco_id") as string | null;
      return <div>{pcoId || "-"}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <div className="max-w-[300px] truncate">{description || "-"}</div>;
    },
  },
  {
    accessorKey: "is_public",
    header: "Public",
    cell: ({ row }) => {
      const isPublic = row.getValue("is_public") as boolean;
      return <div>{isPublic ? "Yes" : "No"}</div>;
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
