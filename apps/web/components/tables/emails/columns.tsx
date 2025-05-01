"use client";

import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

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
  list: {
    pco_list_description: string | null;
    pco_list_category: {
      pco_name: string | null;
      description: string | null;
    } | null;
  } | null;
  category: {
    name: string | null;
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

export const columns: ColumnDef<Email>[] = [
  {
    header: "Subject",
    id: "subject",
    accessorKey: "subject",
    minSize: 300,
    cell: ({ row }) => {
      const email = row.original;
      return (
        <div className="line-clamp-2 w-full min-w-64 max-w-96 text-wrap pl-1">
          <Link href={`/emails/${email.id}`} prefetch={true}>
            <Button
              variant="ghost"
              className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
            >
              {email.subject || "No Subject"}
            </Button>
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

          <div className="flex min-w-52 flex-col pr-3">
            <span className="mt-1 text-muted-foreground">
              {formatDate(row.original.sent_at)}
              {formatDate(row.original.scheduled_for)}
            </span>
          </div>
        </div>
      );
    },
    meta: {
      filterVariant: "select",
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
    header: "To",
    accessorKey: "list",
    cell: ({ row }) => {
      return (
        <div className="flex min-w-64 flex-col pr-3">
          <span className="font-semibold">
            {row.original.list?.pco_list_description}
          </span>
          <span className="text-muted-foreground">
            {row.original.category?.name}
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
          <span className="text-muted-foreground">
            {formatDate(row.original.updated_at) || "—"}
          </span>
        </div>
      );
    },
  },
];
