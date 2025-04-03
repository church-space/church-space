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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@church-space/ui/sheet";
import { Button } from "@church-space/ui/button";
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
        <div className="ml-1 font-medium">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="text-normal w-full justify-start p-0 px-2 text-left"
              >
                <span>{name || "Untitled"}</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{name || "Untitled"}</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <h2 className="text-lg font-bold">{name || "Untitled"}</h2>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      );
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
            <SelectTrigger
              className={cn(
                "h-7 w-[100px] border-none bg-transparent px-2 shadow-none transition-all hover:border hover:bg-background hover:shadow-sm",
                isPublic ? "border border-green-500 bg-green-100" : "bg-muted",
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
