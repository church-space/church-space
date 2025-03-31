"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@church-space/ui/badge";

export type Email = {
  id: number;
  subject: string | null;
  type: "standard" | "template";
  created_at: string;
  organization_id: string;
  from_email: string | null;
  from_name: string | null;
  reply_to: string | null;
  scheduled_for: string | null;
  updated_at: string | null;
  status: string | null;
  sent_at: string | null;
  from_domain: { domain: string } | null;
  reply_to_domain: { domain: string } | null;
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
        className="opacity-0 transition-opacity group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
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
        <Link
          href={`/email/${email.id}`}
          className="font-medium hover:underline"
          prefetch={true}
        >
          {email.subject || "No Subject"}
        </Link>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    enableHiding: true,
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.status === "sent"
              ? "success"
              : row.original.status === "sending"
                ? "warning"
                : row.original.status === "failed"
                  ? "destructive"
                  : row.original.status === "scheduled"
                    ? "default"
                    : "secondary"
          }
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "Scheduled For",
    accessorKey: "scheduled_for",
    cell: ({ row }) => {
      return row.original.scheduled_for
        ? new Date(row.original.scheduled_for).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";
    },
  },
  {
    header: "Sent at",
    accessorKey: "sent_at",
    cell: ({ row }) => {
      return row.original.sent_at
        ? new Date(row.original.sent_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";
    },
  },
  {
    header: "From",
    accessorKey: "from_name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{row.original.from_name}</span>
          <span className="text-muted-foreground">
            {row.original.from_email && row.original.from_domain
              ? `${row.original.from_email}@${row.original.from_domain.domain}`
              : row.original.from_email || "—"}
          </span>
        </div>
      );
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
