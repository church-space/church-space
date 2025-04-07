"use client";

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
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="opacity-0 transition-opacity group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
  //     />
  //   ),
  //   enableSorting: false,
  // },
  {
    header: "Subject",
    id: "subject",
    accessorKey: "subject",
    minSize: 300,
    cell: ({ row }) => {
      const email = row.original;
      return (
        <div className="min-w-64 text-wrap px-3">
          <Link
            href={`/emails/${email.id}`}
            className="max-w-40 text-wrap font-medium hover:underline"
            prefetch={true}
          >
            {email.subject || "No Subject"}
          </Link>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableHiding: true,
    cell: ({ row }) => {
      return (
        <div className="pr-3">
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
        </div>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "Date",
    accessorKey: "sent_at",
    cell: ({ row }) => {
      if (row.original.sent_at) {
        return (
          <div className="flex min-w-52 flex-col pr-3">
            <span>Sent at</span>
            <span className="font-semibold">
              {new Date(row.original.sent_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          </div>
        );
      } else if (row.original.scheduled_for) {
        return (
          <div className="flex min-w-52 flex-col pr-3">
            <span>Scheduled for</span>
            <span className="font-semibold">
              {new Date(row.original.scheduled_for).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                },
              )}
            </span>
          </div>
        );
      }
      return "—";
    },
  },
  {
    header: "From",
    accessorKey: "from_name",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-64 flex-col pr-3">
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
    header: "Updated",
    accessorKey: "updated_at",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-52 flex-col pr-3">
          <span className="font-semibold">
            {row.original.updated_at
              ? new Date(row.original.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
              : "—"}
          </span>
        </div>
      );
    },
  },
];
