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

export const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: "subject",
    header: "Name",
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
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => {
      return <span>{formatDate(row.getValue("updated_at"))}</span>;
    },
  },
];
