"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getEmailFilterConfig, type EmailStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import NewEmail from "../../forms/new-email";
import { useEmails } from "@/hooks/use-emails";

interface EmailsTableProps {
  organizationId: string;
}

export default function EmailsTable({ organizationId }: EmailsTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [status, setStatus] = useQueryState("status");
  const [isNewEmailOpen, setIsNewEmailOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useEmails(
    organizationId,
    search ?? undefined,
    status ?? undefined,
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

  // Flatten all pages of data
  const emails = data?.pages.flatMap((page) => page.data) ?? [];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Emails
        </h1>
        <Button onClick={() => setIsNewEmailOpen(true)}>New Email</Button>
      </div>
      <DataTable
        columns={columns}
        data={emails}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          return {
            data: result.data?.pages[result.data.pages.length - 1]?.data ?? [],
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
        isLoading={isFetchingNextPage}
      />

      <Dialog open={isNewEmailOpen} onOpenChange={setIsNewEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email</DialogTitle>
          </DialogHeader>
          <NewEmail organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
