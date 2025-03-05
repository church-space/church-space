"use client";

import { Checkbox } from "@church-space/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { EMAIL_STATUS_OPTIONS } from "./filters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@church-space/ui/sheet";

export type Person = {
  id: number;
  pco_id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  nickname: string | null;
  given_name: string | null;
  organization_id: string;
  people_emails: Array<{
    id: number;
    email: string;
    status: "subscribed" | "unsubscribed" | "pco_blocked";
    pco_person_id: string;
    organization_id: string;
  }>;
  email_category_unsubscribes: Array<any>;
};

export const columns: ColumnDef<Person>[] = [
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
      />
    ),
    enableSorting: false,
  },
  {
    header: "Name",
    id: "name",
    accessorFn: (row) =>
      `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
    cell: ({ row }) => {
      const person = row.original;
      return (
        <Sheet>
          <SheetTrigger>
            <div className="font-medium hover:underline">
              {person.first_name} {person.last_name}
            </div>
            {person.nickname && (
              <div className="text-sm text-muted-foreground">
                ({person.nickname})
              </div>
            )}
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {person.first_name} {person.last_name}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              {person.email_category_unsubscribes.map((unsubscribe) => (
                <div key={unsubscribe.id}>
                  {unsubscribe.email_categories.name}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      );
    },
  },
  {
    header: "Email",
    accessorFn: (row) => row.people_emails?.[0]?.email,
    cell: ({ row }) => {
      const emails = row.original.people_emails;
      if (!emails?.length) return null;

      return (
        <div className="space-y-1">
          {emails.map((email) => (
            <div key={email.id} className="text-sm">
              {email.email}
              <span className="ml-1 text-xs text-muted-foreground">
                ({email.status})
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "emailStatus",
    accessorFn: (row) => {
      const firstEmail = row.people_emails?.[0];
      if (!firstEmail) return undefined;

      // If subscribed but has unsubscribe categories, mark as partially subscribed
      if (
        firstEmail.status === "subscribed" &&
        row.email_category_unsubscribes?.length > 0
      ) {
        return "partially subscribed";
      }

      return firstEmail.status;
    },
    enableHiding: true,
    // This column is hidden by default and only used for filtering
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "PCO ID",
    accessorKey: "pco_id",
    meta: {
      filterVariant: "text",
    },
  },
];
