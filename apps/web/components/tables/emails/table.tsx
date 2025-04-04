"use client";

import { useEmails } from "@/hooks/use-emails";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import NewEmail from "../../forms/new-email";
import DataTable from "../data-table";
import { columns, type Email } from "./columns";
import { getEmailFilterConfig, type EmailStatus } from "./filters";
import { Skeleton } from "@church-space/ui/skeleton";
import { NewEmail as NewEmailIcon } from "@church-space/ui/icons";

interface EmailsTableProps {
  organizationId: string;
  initialData: Email[];
  initialCount: number;
  initialSearch?: string;
  initialStatus?: EmailStatus;
}

export default function EmailsTable({
  organizationId,
  initialData,
  initialCount,
  initialSearch,
  initialStatus,
}: EmailsTableProps) {
  const [search, setSearch] = useQueryState("search", {
    parse: (value) => value,
    serialize: (value) => value ?? null,
    history: "push",
  });
  const [status, setStatus] = useQueryState<EmailStatus | null>("status", {
    parse: (value): EmailStatus | null => {
      if (
        value === "scheduled" ||
        value === "sent" ||
        value === "sending" ||
        value === "draft" ||
        value === "failed"
      ) {
        return value;
      }
      return null;
    },
    serialize: (value) => value || "all",
    history: "push",
  });
  const [isNewEmailOpen, setIsNewEmailOpen] = useState(false);

  // Initialize search and status if they're not set and we have initial values
  const effectiveSearch = search ?? initialSearch;
  const effectiveStatus = status ?? initialStatus;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmails(
      organizationId,
      effectiveSearch ?? undefined,
      effectiveStatus ?? undefined,
      {
        initialData:
          effectiveSearch === initialSearch && effectiveStatus === initialStatus
            ? {
                pages: [
                  { data: initialData, count: initialCount, nextPage: 1 },
                ],
                pageParams: [0],
              }
            : undefined,
      },
    );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: EmailStatus) => {
      await setStatus(value === "all" ? null : value);
    },
    [setStatus],
  );

  // Flatten all pages of data and cast to Email type
  const emails = (data?.pages.flatMap((page) => page?.data ?? []) ??
    []) as Email[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          <span className="font-normal text-muted-foreground">
            {isLoading ? <Skeleton className="h-7 w-6" /> : count}
          </span>{" "}
          {count === 1 ? "Email" : "Emails"}
        </h1>
        <Button onClick={() => setIsNewEmailOpen(true)}>New Email</Button>
      </div>
      <DataTable
        columns={columns}
        data={emails}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          const nextPageData = (result.data?.pages[result.data.pages.length - 1]
            ?.data ?? []) as Email[];
          return {
            data: nextPageData,
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={effectiveSearch || ""}
        onSearch={handleSearch}
        filterConfig={getEmailFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: effectiveStatus ?? undefined,
        }}
        searchPlaceholderText="Search by subject..."
        isLoading={isLoading || isFetchingNextPage}
      />

      <Dialog open={isNewEmailOpen} onOpenChange={setIsNewEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Email
            </DialogTitle>
            <DialogDescription className="text-pretty">
              What&apos;s the subject of your email? You can always change it
              later.
            </DialogDescription>
          </DialogHeader>

          <NewEmail organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
