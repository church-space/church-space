"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@church-space/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@church-space/ui/sheet";

export type Email = {
  id: number;
  subject: string | null;
  type: string;
  created_at: string;
  organization_id: string;
  from_email: string | null;
  from_name: string | null;
  reply_to: string | null;
  scheduled_for: string | null;
  updated_at: string | null;
};

export const columns: ColumnDef<Email>[] = [
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
      />
    ),
    enableSorting: false,
  },
  {
    header: "Subject",
    id: "subject",
    accessorKey: "subject",
    cell: ({ row }) => {
      const email = row.original;
      return (
        <Sheet>
          <SheetTrigger>
            <div className="font-medium hover:underline">
              {email.subject || "No Subject"}
            </div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{email.subject || "No Subject"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div>Type: {email.type}</div>
              <div>From: {email.from_name || email.from_email || "N/A"}</div>
              <div>
                Created: {new Date(email.created_at).toLocaleDateString()}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      );
    },
  },
  {
    header: "Type",
    accessorKey: "type",
    meta: {
      filterVariant: "select",
      enumValues: ["standard"],
    },
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString();
    },
  },
];
