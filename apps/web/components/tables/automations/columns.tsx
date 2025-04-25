"use client";

import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export type EmailAutomation = {
  id: number;
  created_at: string;
  name: string;
  trigger_type: string | null;
  list_id: number | null;
  description: string | null;
  organization_id: string;
  is_active: boolean;
  updated_at: string | null;
};

export const columns: ColumnDef<EmailAutomation>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <Link href={`/emails/automations/${row.original.id}`} prefetch={true}>
          <Button
            variant="ghost"
            className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:underline [&_svg]:size-3"
          >
            <span>{name || "Untitled"}</span>
          </Button>
        </Link>
      );
    },
  },
  {
    id: "is_active",
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="w-fit">
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
      enumValues: ["true", "false"],
    },
    filterFn: (row, id, filterValue) => {
      if (filterValue === "all") return true;
      const value = row.getValue(id) as boolean;
      return value === (filterValue === "true");
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
