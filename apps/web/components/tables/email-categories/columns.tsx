"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@church-space/ui/select";
import { cn } from "@church-space/ui/cn";

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
      return (
        <div className="ml-1 text-base font-medium">
          <span>{name || "Untitled"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_public",
    header: "Visibility",
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
            <SelectTrigger
              className={cn(
                "h-7 w-[100px] rounded-lg bg-transparent px-3 shadow-sm transition-all",
                isPublic
                  ? "border border-green-500 bg-green-100 dark:bg-green-900"
                  : "bg-muted",
              )}
            >
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
