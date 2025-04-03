"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@church-space/ui/select";

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
    accessorKey: "pco_name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("pco_name") as string | null;
      return <div className="ml-3 font-medium">{name || "Untitled"}</div>;
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
      const id = row.original.id;

      const handleValueChange = (value: string) => {
        // Here you would update the value in your database
        console.log(
          `Updating email category ${id} to ${value === "public" ? true : false}`,
        );
        // You might want to add API call here to update the value
      };

      return (
        <div>
          <Select
            defaultValue={isPublic ? "public" : "hidden"}
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="h-8 w-[100px] border-none bg-transparent shadow-none transition-all hover:border hover:bg-background hover:shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
