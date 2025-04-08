"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@church-space/ui/badge";

export type EmailRecipient = {
  id: number;
  email_address: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  person: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export const columns: ColumnDef<EmailRecipient>[] = [
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
      return (
        <div className="pr-3">
          <Badge
            variant={
              row.original.status === "sent"
                ? "success"
                : row.original.status === "opened"
                  ? "success"
                  : row.original.status === "delivered"
                    ? "success"
                    : row.original.status === "bounced"
                      ? "destructive"
                      : row.original.status === "complained"
                        ? "destructive"
                        : row.original.status === "pending"
                          ? "warning"
                          : row.original.status === "did-not-send"
                            ? "secondary"
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
    header: "Name",
    accessorKey: "person",
    cell: ({ row }) => {
      const person = row.original.person;
      return (
        <div className="flex min-w-52 flex-col pr-3">
          {person && (person.first_name || person.last_name) ? (
            <span className="font-semibold">
              {[person.first_name, person.last_name]
                .filter(Boolean)
                .join(" ") || "No Name"}
            </span>
          ) : (
            <span className="text-muted-foreground">No Name</span>
          )}
        </div>
      );
    },
  },
];
