"use client";

import { useEmailRecipients } from "@/hooks/use-email-recipients";
import { useQueryState } from "nuqs";
import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, type EmailRecipient } from "./columns";
import {
  getEmailCategoryFilterConfig,
  type EmailRecipientStatus,
} from "./filters";
import NullState from "./null-state";

interface EmailRecipientsTableProps {
  emailId: number;
  initialData: EmailRecipient[];
  initialCount: number;
  initialSearch?: string;
  initialStatus?: EmailRecipientStatus;
}

export default function EmailRecipientsTable({
  emailId,
  initialData,
  initialCount,
  initialSearch,
  initialStatus,
}: EmailRecipientsTableProps) {
  const [search, setSearch] = useQueryState("search", {
    parse: (value) => value,
    serialize: (value) => value ?? null,
    history: "push",
  });
  const [status, setStatus] = useQueryState<EmailRecipientStatus | null>(
    "status",
    {
      parse: (value): EmailRecipientStatus | null => {
        if (
          value === "all" ||
          value === "sent" ||
          value === "delivered" ||
          value === "bounced" ||
          value === "opened" ||
          value === "complained" ||
          value === "pending" ||
          value === "did-not-send"
        ) {
          return value;
        }
        return null;
      },
      serialize: (value) => value || "all",
      history: "push",
    },
  );

  // Initialize search and status if they're not set and we have initial values
  const effectiveSearch = search ?? initialSearch ?? "";
  const effectiveStatus = status ?? initialStatus ?? "all";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailRecipients(
      emailId,
      effectiveSearch || undefined,
      effectiveStatus === "all" ? undefined : effectiveStatus,
      {
        initialData: initialData?.length
          ? {
              pages: [
                {
                  data: initialData,
                  count: initialCount,
                  nextPage: initialData.length >= 50 ? 1 : undefined,
                },
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
    async (value: EmailRecipientStatus) => {
      await setStatus(value === "all" ? null : value);
    },
    [setStatus],
  );

  // Flatten all pages of data and cast to Email type
  const emails = (data?.pages.flatMap((page) => page?.data ?? []) ??
    initialData ??
    []) as EmailRecipient[];

  return (
    <>
      <DataTable
        columns={columns}
        data={emails}
        pageSize={50}
        loadMore={async () => {
          const result = await fetchNextPage();
          const nextPageData = (result.data?.pages[result.data.pages.length - 1]
            ?.data ?? []) as EmailRecipient[];
          return {
            data: nextPageData,
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={effectiveSearch}
        onSearch={handleSearch}
        filterConfig={getEmailCategoryFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: effectiveStatus === "all" ? undefined : effectiveStatus,
        }}
        searchPlaceholderText="Search by email address..."
        isLoading={isLoading || isFetchingNextPage}
        nullState={<NullState onClick={() => {}} />}
      />
    </>
  );
}
