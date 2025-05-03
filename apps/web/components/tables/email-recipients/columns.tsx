"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@church-space/ui/badge";

export type EmailRecipient = {
  id: number;
  email_address: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  unsubscribed: boolean;
  clicked: boolean;
};

export const columns: ColumnDef<EmailRecipient>[] = [
  {
    header: "Name",
    accessorKey: "last_name",
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
      return (
        <div className="flex min-w-52 flex-col pr-3">
          {first_name || last_name ? (
            <span className="font-semibold">
              {[first_name, last_name].filter(Boolean).join(" ") || "No Name"}
            </span>
          ) : (
            <span className="text-muted-foreground">No Name</span>
          )}
        </div>
      );
    },
  },
  {
    header: "Email Address",
    id: "email_address",
    accessorKey: "email_address",
    minSize: 300,
    cell: ({ row }) => {
      return (
        <div className="min-w-64 text-wrap px-3">
          {row.original.email_address || "No Email Address"}
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
      const { unsubscribed, clicked, status } = row.original;

      let displayText: string;
      let variant: React.ComponentProps<typeof Badge>["variant"];

      if (unsubscribed) {
        displayText = "Unsubscribed";
        variant = "warning";
      } else if (clicked) {
        displayText = "Clicked";
        variant = "outline";
      } else {
        displayText = status || "Unknown";
        variant =
          status === "sent"
            ? "successOutline"
            : status === "opened"
              ? "success"
              : status === "delivered"
                ? "successOutline"
                : status === "bounced"
                  ? "destructive"
                  : status === "complained"
                    ? "destructive"
                    : status === "pending"
                      ? "warning"
                      : status === "did-not-send"
                        ? "destructive"
                        : "secondary";
      }
      return (
        <div className="pr-3">
          <Badge variant={variant} className="capitalize">
            {displayText} {clicked ? "🔍" : ""}
          </Badge>
        </div>
      );
    },
    meta: {
      filterVariant: "select",
    },
  },
];
