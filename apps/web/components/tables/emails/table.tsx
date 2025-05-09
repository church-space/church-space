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
import { useCallback } from "react";
import NewEmail from "../../forms/new-email";
import DataTable from "../data-table";
import { columns, type Email } from "./columns";
import { getEmailFilterConfig, type EmailStatus } from "./filters";
import { NewEmail as NewEmailIcon } from "@church-space/ui/icons";
import NullState from "./null-state";

interface EmailsTableProps {
  organizationId: string;
}

export default function EmailsTable({ organizationId }: EmailsTableProps) {
  // Move all hooks to the top
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

  const [isNewEmailOpen, setIsNewEmailOpen] = useQueryState("newEmailOpen", {
    parse: (value) => value === "true",
    serialize: (value) => value?.toString() ?? null,
    history: "push",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useEmails(organizationId, search ?? undefined, status ?? undefined);

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

  // Now handle the loading state
  if (!organizationId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Flatten all pages of data and cast to Email type
  const emails = (data?.pages.flatMap((page) => page?.data ?? []) ??
    []) as Email[];

  // Show loading state during both initial load and navigation
  const showLoading = isLoading || isFetching;

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">Emails</h1>
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
        searchQuery={search || ""}
        onSearch={handleSearch}
        filterConfig={getEmailFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: status ?? undefined,
        }}
        searchPlaceholderText="Search by subject..."
        isLoading={showLoading || isFetchingNextPage}
        nullState={<NullState onClick={() => setIsNewEmailOpen(true)} />}
      />

      <Dialog open={isNewEmailOpen ?? false} onOpenChange={setIsNewEmailOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Email
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              What&apos;s the subject of your email? You can always change it
              later.
            </DialogDescription>
          </DialogHeader>

          <NewEmail
            organizationId={organizationId}
            setIsNewEmailOpen={setIsNewEmailOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
