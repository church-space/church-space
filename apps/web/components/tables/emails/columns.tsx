"use client";

import { Badge } from "@church-space/ui/badge";
import { Button } from "@church-space/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
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
  } | null;
  category: {
    name: string | null;
  } | null;
  metrics: {
    total_sent: number | null;
    total_opens: number | null;
    total_clicks: number | null;
  } | null;
};

const currentYear = new Date().getFullYear();

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString();
};

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
        <div className="flex -translate-x-4 items-center gap-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="text-muted-foreground hover:text-foreground [&_svg]:size-4"
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <Link href={`/emails/${email.id}`} prefetch={false}>
                <DropdownMenuItem> View</DropdownMenuItem>
              </Link>
              {email.status === "draft" && (
                <Link href={`/emails/${email.id}/editor`} prefetch={false}>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem>Replicate</DropdownMenuItem>
              {email.status === "draft" && (
                <DropdownMenuItem>Delete</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="line-clamp-2 w-full min-w-64 max-w-96 text-wrap">
            <Link href={`/emails/${email.id}`} prefetch={true}>
              <Button
                variant="ghost"
                className="group h-16 w-full items-center justify-start gap-3 truncate text-wrap px-0 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
              >
                {email.subject || "No Subject"}
              </Button>
            </Link>
          </div>
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
          {row.original.metrics?.total_sent && (
            <span className="text-muted-foreground">
              {row.original.metrics?.total_sent
                ? formatNumber(row.original.metrics.total_sent)
                : "—"}{" "}
              recipients
            </span>
          )}
        </div>
      );
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
    header: "Metrics",
    accessorKey: "metrics",
    cell: ({ row }) => {
      const metrics = row.original.metrics;
      const sent = metrics?.total_sent || 0;
      const opens = metrics?.total_opens || 0;
      const clicks = metrics?.total_clicks || 0;
      const percentageOpens = sent > 0 ? (opens / sent) * 100 : 0;
      const percentageClicks = sent > 0 ? (clicks / sent) * 100 : 0;

      if (sent === 0) {
        return null;
      }

      return (
        <div className="group">
          <div className="hidden min-w-64 flex-col gap-1 group-hover:flex">
            <div>
              <span className="font-semibold">{formatNumber(opens)}</span> Opens
            </div>
            <div>
              <span className="font-semibold">{formatNumber(clicks)}</span>{" "}
              Clicks
            </div>
          </div>
          <div className="flex min-w-64 flex-col gap-1 group-hover:hidden">
            <div>
              <span className="font-semibold">
                {percentageOpens.toFixed(2)}%
              </span>{" "}
              Opened
            </div>
            <div>
              <span className="font-semibold">
                {percentageClicks.toFixed(2)}%
              </span>{" "}
              Clicked
            </div>
          </div>
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
