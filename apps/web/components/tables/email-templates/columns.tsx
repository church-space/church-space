"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@church-space/ui/button";

// Define the type based on the SQL schema
export type EmailTemplate = {
  id: number;
  created_at: string;
  subject: string;
  updated_at: string;
};

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string;

      return (
        <>
          <Link href={`/emails/${row.original.id}/editor`}>
            <Button
              variant="ghost"
              className="group h-16 w-full items-center justify-start gap-3 truncate px-1.5 text-left text-base hover:bg-transparent hover:underline [&_svg]:size-3"
            >
              <span>{subject}</span>
            </Button>
          </Link>
        </>
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
