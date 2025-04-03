"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@church-space/ui/sheet";
import { Label } from "@church-space/ui/label";
import { Button } from "@church-space/ui/button";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@church-space/ui/badge";
import { Checkbox } from "@church-space/ui/checkbox";
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
    status: "subscribed" | "unsubscribed" | "pco_blocked" | "cleaned";
    pco_person_id: string;
    organization_id: string;
  }>;
  email_list_category_unsubscribes: Array<any>;
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
        className="opacity-0 transition-opacity group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
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
          <SheetTrigger className="px-2">
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
            <SheetHeader className="flex flex-row items-center justify-between gap-2">
              <SheetTitle>
                {person.first_name} {person.last_name}
              </SheetTitle>
              <Link
                href={`https://people.planningcenteronline.com/people/AC${person.pco_id}`}
                target="_blank"
              >
                <Button variant="outline">View in PCO</Button>
              </Link>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              <div className="flex flex-col gap-1">
                <Label>Status</Label>
                <Badge className="w-fit capitalize">
                  {person.email_list_category_unsubscribes.length > 0
                    ? "Partially Subscribed"
                    : person.people_emails?.[0]?.status || "No status"}
                </Badge>
              </div>
              {person.email_list_category_unsubscribes.map((unsubscribe) => (
                <div key={unsubscribe.id}>
                  {unsubscribe.pco_list_categories.pco_name}
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
            </div>
          ))}
        </div>
      );
    },
  },
  {
    header: "Status",
    id: "emailStatus",
    cell: ({ row }) => {
      const firstEmail = row.original.people_emails?.[0];
      if (!firstEmail) return undefined;

      // If subscribed but has unsubscribe categories, mark as partially subscribed
      if (
        firstEmail.status === "subscribed" &&
        row.original.email_list_category_unsubscribes?.length > 0
      ) {
        return <Badge className="w-fit capitalize">Partially Subscribed</Badge>;
      }

      return (
        <Badge
          variant={firstEmail.status === "subscribed" ? "success" : "outline"}
          className="w-fit capitalize"
        >
          {firstEmail.status}
        </Badge>
      );
    },
    enableHiding: true,
    // This column is hidden by default and only used for filtering
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "View in PCO",
    accessorKey: "pco_id",
    meta: {
      filterVariant: "text",
    },
    cell: ({ row }) => {
      const person = row.original;
      return (
        <Link
          href={`https://people.planningcenteronline.com/people/AC${person.pco_id}`}
          target="_blank"
        >
          <Button variant="outline" size="icon">
            <ExternalLinkIcon className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
