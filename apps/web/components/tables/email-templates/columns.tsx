"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

// Define the type based on the SQL schema
export type EmailTemplate = {
  id: number;
  created_at: string;
  subject: string;
};

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string;
      return <div className="pl-2 text-base font-medium">{subject}</div>;
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
