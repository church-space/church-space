"use client";

import { cn } from "@church-space/ui/cn";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@church-space/ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
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
        <div className="ml-1 flex flex-shrink-0 items-center gap-1 text-base font-medium">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="group w-full items-start justify-normal px-1.5 text-left text-base [&_svg]:size-3"
              >
                <span>{name || "Untitled"}</span>
                <Pencil className="hidden h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
        <div
          className={cn(
            "ml-1 text-base font-medium",
            description ? "" : "text-sm text-muted-foreground",
          )}
        >
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
