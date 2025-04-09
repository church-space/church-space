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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";

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
    protected_from_cleaning: boolean;
    reason: string | null;
  }>;
  email_list_category_unsubscribes: Array<{
    id: number;
    email_address: string;
    pco_list_category: number;
    pco_list_categories: {
      pco_name: string;
      pco_id: string;
    };
  }>;
};

export const columns: ColumnDef<Person>[] = [
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
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="w-fit capitalize">Partially Subscribed</Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.email_list_category_unsubscribes.length > 0 && (
                <div className="max-w-[300px]">
                  <p className="mb-1 font-medium">Unsubscribed from:</p>
                  {row.original.email_list_category_unsubscribes.map(
                    (unsubscribe) => (
                      <p key={unsubscribe.id} className="line-clamp-1 text-sm">
                        {unsubscribe.pco_list_categories.pco_name}
                      </p>
                    ),
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      }
      if (firstEmail.status === "cleaned") {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={"outline"} className="w-fit capitalize">
                Cleaned
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              {firstEmail.reason === "three bounces" ? (
                <p>
                  This email has marked your emails as{" "}
                  <u>
                    <b>spam</b>
                  </u>{" "}
                  three times, so we are excluding it from email list in order
                  to help your email deliverability.
                </p>
              ) : firstEmail.reason === "email bounced" ? (
                <p>
                  An email sent to this address{" "}
                  <u>
                    <b>bounced</b>
                  </u>
                  , so we are excluding it from email list in order to help your
                  email deliverability.
                </p>
              ) : (
                <p>Cleaned</p>
              )}
            </TooltipContent>
          </Tooltip>
        );
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
