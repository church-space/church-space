"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { updatePersonSubscriptionStatusAction } from "@/actions/update-person-subscription-status";
import { deleteCategoryUnsubscribeAction } from "@/actions/delete-category-unsubscribe";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  email_category_unsubscribes: Array<{
    id: number;
    email_address: string;
    category_id: number;
    email_categories: {
      id: number;
      name: string;
    };
  }>;
};

const NameCell = ({ person }: { person: Person }) => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState<number | null>(
    null,
  );
  const [optimisticStatus, setOptimisticStatus] = useState<{
    status?: "subscribed" | "unsubscribed" | "pco_blocked" | "cleaned";
    categoryUnsubscribes?: number[];
  }>({});
  const queryClient = useQueryClient();

  const [isCategroyResubOpen, setIsCategroyResubOpen] = useState(false);
  const [isUnsubscribeAllOpen, setIsUnsubscribeAllOpen] = useState(false);

  const handleStatusUpdate = async (
    newStatus: "subscribed" | "unsubscribed" | "pco_blocked" | "cleaned",
  ) => {
    setIsLoading(true);
    setOptimisticStatus({
      status: newStatus,
      categoryUnsubscribes:
        newStatus === "unsubscribed"
          ? []
          : person.email_category_unsubscribes.map((u) => u.id),
    });

    try {
      await updatePersonSubscriptionStatusAction({
        emailId: person.people_emails?.[0]?.id,
        status: newStatus,
      });
      // Invalidate the people query to refresh the table data
      await queryClient.invalidateQueries({ queryKey: ["people"] });
    } catch {
      // Revert optimistic update on error
      setOptimisticStatus({});
    } finally {
      setIsUnsubscribeAllOpen(false);
      setIsLoading(false);
    }
  };

  const handleCategoryResubscribe = async (categoryId: number) => {
    setIsCategoryLoading(categoryId);
    setOptimisticStatus((prev) => ({
      ...prev,
      categoryUnsubscribes: prev.categoryUnsubscribes?.filter(
        (id) => id !== categoryId,
      ),
    }));

    try {
      await deleteCategoryUnsubscribeAction({
        emailId: person.people_emails?.[0]?.id,
        categoryId,
      });
      // Invalidate the people query to refresh the table data
      await queryClient.invalidateQueries({ queryKey: ["people"] });
    } catch {
      // Revert optimistic update on error
      setOptimisticStatus((prev) => ({
        ...prev,
        categoryUnsubscribes: [
          ...(prev.categoryUnsubscribes || []),
          categoryId,
        ],
      }));
    } finally {
      setIsCategroyResubOpen(false);
      setIsCategoryLoading(null);
    }
  };

  const currentStatus =
    optimisticStatus.status ?? person.people_emails?.[0]?.status;
  const currentCategoryUnsubscribes =
    optimisticStatus.categoryUnsubscribes ??
    person.email_category_unsubscribes.map((u) => u.id);

  return (
    <Sheet>
      <SheetTrigger className="min-w-44 px-2 text-left">
        <div className="text-base font-medium hover:underline">
          {person.first_name} {person.last_name}
        </div>
        {person.nickname && (
          <div className="text-sm text-muted-foreground">
            ({person.nickname})
          </div>
        )}
      </SheetTrigger>
      <SheetContent
        className="h-[95%] w-full md:h-full md:max-w-lg"
        side={isMobile ? "bottom" : "right"}
      >
        <SheetHeader className="flex flex-col space-y-0">
          <SheetTitle className="flex flex-row items-center gap-2">
            {person.first_name} {person.last_name}
            <Badge
              className="w-fit -translate-x-0.5 capitalize"
              variant={
                currentStatus === "unsubscribed"
                  ? "outline"
                  : currentCategoryUnsubscribes.length > 0
                    ? "default"
                    : currentStatus === "subscribed"
                      ? "success"
                      : "outline"
              }
            >
              {currentStatus === "unsubscribed"
                ? "unsubscribed"
                : currentCategoryUnsubscribes.length > 0
                  ? "Partially Subscribed"
                  : currentStatus}
            </Badge>
          </SheetTitle>

          <SheetDescription>
            {person.people_emails?.[0]?.email}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-8 overflow-y-auto">
          <div className="flex gap-2">
            <Dialog
              open={isUnsubscribeAllOpen}
              onOpenChange={setIsUnsubscribeAllOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full" disabled={isLoading}>
                  {currentStatus === "unsubscribed"
                    ? "Resubscribe"
                    : currentCategoryUnsubscribes.length > 0
                      ? "Unsubscribe from All"
                      : currentStatus === "subscribed"
                        ? "Unsubscribe"
                        : "Resubscribe"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentStatus === "unsubscribed"
                      ? "Resubscribe"
                      : currentCategoryUnsubscribes.length > 0
                        ? "Unsubscribe from All"
                        : currentStatus === "subscribed"
                          ? "Unsubscribe"
                          : "Resubscribe"}
                  </DialogTitle>
                  <DialogDescription>
                    {currentStatus === "unsubscribed" ? (
                      <span>
                        Are you sure you want to resubscribe{" "}
                        <b>
                          <u>{person.people_emails?.[0]?.email}</u>
                        </b>{" "}
                        to all emails? Please make sure you have explicit
                        permission to resubscribe this person. Otherwise, you
                        risk being marked as spam which will hurt your email
                        deliverability.
                      </span>
                    ) : currentCategoryUnsubscribes.length > 0 ? (
                      <span>
                        Are you sure you want to unsubscribe{" "}
                        <b>
                          <u>{person.people_emails?.[0]?.email}</u>
                        </b>{" "}
                        from all email categories?
                      </span>
                    ) : currentStatus === "subscribed" ? (
                      <span>
                        Are you sure you want to unsubscribe{" "}
                        <b>
                          <u>{person.people_emails?.[0]?.email}</u>
                        </b>{" "}
                        from all emails?
                      </span>
                    ) : (
                      <span>
                        Are you sure you want to resubscribe{" "}
                        <b>
                          <u>{person.people_emails?.[0]?.email}</u>
                        </b>{" "}
                        to all emails? Please make sure you have explicit
                        permission to resubscribe this person. Otherwise, you
                        risk being marked as spam which will hurt your email
                        deliverability.
                      </span>
                    )}
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant={
                        currentStatus === "unsubscribed"
                          ? "default"
                          : currentCategoryUnsubscribes.length > 0
                            ? "destructive"
                            : currentStatus === "subscribed"
                              ? "destructive"
                              : "default"
                      }
                      disabled={isLoading}
                      onClick={() =>
                        handleStatusUpdate(
                          currentStatus === "unsubscribed"
                            ? "subscribed"
                            : currentCategoryUnsubscribes.length > 0
                              ? "unsubscribed"
                              : currentStatus === "subscribed"
                                ? "unsubscribed"
                                : "subscribed",
                        )
                      }
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </div>
                      ) : currentStatus === "unsubscribed" ? (
                        "Resubscribe"
                      ) : currentCategoryUnsubscribes.length > 0 ? (
                        "Unsubscribe from All"
                      ) : currentStatus === "subscribed" ? (
                        "Unsubscribe"
                      ) : (
                        "Resubscribe"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Link
              href={`https://people.planningcenteronline.com/people/AC${person.pco_id}`}
              target="_blank"
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                View in PCO
              </Button>
            </Link>
          </div>

          {currentCategoryUnsubscribes.length > 0 &&
            currentStatus !== "unsubscribed" && (
              <div className="flex flex-col gap-2">
                <Label>Unsubscribed from:</Label>
                {person.email_category_unsubscribes
                  .filter((u) => currentCategoryUnsubscribes.includes(u.id))
                  .map((unsubscribe) => (
                    <div
                      key={unsubscribe.id}
                      className="flex items-center justify-between rounded-md border bg-muted p-2 px-2.5 text-sm"
                    >
                      {unsubscribe.email_categories.name}
                      <Dialog
                        open={isCategroyResubOpen}
                        onOpenChange={setIsCategroyResubOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCategoryLoading === unsubscribe.id}
                          >
                            {isCategoryLoading === unsubscribe.id ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Processing...
                              </div>
                            ) : (
                              "Resubscribe"
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Resubscribe to {unsubscribe.email_categories.name}
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to resubscribe{" "}
                              <b>
                                <u>{person.people_emails?.[0]?.email}</u>
                              </b>{" "}
                              to {unsubscribe.email_categories.name}? Please
                              make sure you have explicit permission to
                              resubscribe this person. Otherwise, you risk being
                              marked as spam which will hurt your email
                              deliverability.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="default"
                              disabled={isCategoryLoading === unsubscribe.id}
                              onClick={() => {
                                handleCategoryResubscribe(
                                  unsubscribe.email_categories.id,
                                );
                              }}
                            >
                              {isCategoryLoading === unsubscribe.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  Processing...
                                </div>
                              ) : (
                                "Resubscribe"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
              </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const columns: ColumnDef<Person>[] = [
  {
    header: "Name",
    id: "name",
    accessorFn: (row) =>
      `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
    cell: ({ row }) => {
      return <NameCell person={row.original} />;
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
        row.original.email_category_unsubscribes?.length > 0
      ) {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="w-fit capitalize">Partially Subscribed</Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.email_category_unsubscribes.length > 0 && (
                <div className="max-w-[300px]">
                  <p className="mb-1 font-medium">Unsubscribed from:</p>
                  {row.original.email_category_unsubscribes.map(
                    (unsubscribe) => (
                      <p key={unsubscribe.id} className="line-clamp-1 text-sm">
                        {unsubscribe.email_categories.name}
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
