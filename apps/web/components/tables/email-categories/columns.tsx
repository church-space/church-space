"use client";

import { ColumnDef } from "@tanstack/react-table";

// Define the type based on the SQL schema
export type EmailCategory = {
  id: number;
  created_at: string;
  name: string | null;
  organization_id: string | null;
  description: string | null;
  updated_at: string | null;
};

export const columns: ColumnDef<EmailCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      return (
        <div className="ml-1 text-base font-medium">
          <span>{name || "Untitled"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="ml-1 text-base font-medium">
          <span>{description || "No description"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string | null;
      if (!updatedAt) {
        return <span>-</span>;
      }
      const date = new Date(updatedAt);
      return (
        <span>{isNaN(date.getTime()) ? "-" : date.toLocaleDateString()}</span>
      );
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
