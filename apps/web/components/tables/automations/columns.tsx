"use client";

import { Badge } from "@church-space/ui/badge";
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
          <div className="pl-2 text-base font-medium hover:underline">
            {name}
          </div>
        </Link>
      );
    },
  },
  {
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
