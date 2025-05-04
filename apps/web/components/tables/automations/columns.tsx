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
  list: {
    pco_list_description: string | null;
  } | null;
};

const currentYear = new Date().getFullYear();

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateYear = date.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  };
  if (dateYear !== currentYear) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-US", options);
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
            className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
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
        <Badge variant={isActive ? "success" : "secondary"} className="w-fit">
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
    accessorKey: "list",
    header: "Planning Center List",
    cell: ({ row }) => {
      const list = row.getValue("list") as {
        pco_list_description: string | null;
      } | null;
      return <span>{list?.pco_list_description || "None"}</span>;
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      return <span>{formatDate(row.getValue("updated_at"))}</span>;
    },
  },
];
