"use client";

import { useEmailAutomations } from "@/hooks/use-email-automations";
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
import DataTable from "../data-table";
import { columns, type EmailAutomation } from "./columns";
import { getAutomationFilterConfig, type AutomationStatus } from "./filters";
import { Skeleton } from "@church-space/ui/skeleton";
import { NewEmail as NewEmailIcon } from "@church-space/ui/icons";
import NewEmailAutomation from "../../forms/new-automation";

interface AutomationsTableProps {
  organizationId: string;
}

export default function AutomationsTable({
  organizationId,
}: AutomationsTableProps) {
  const [search, setSearch] = useQueryState("search", {
    parse: (value) => value,
    serialize: (value) => value ?? null,
    history: "push",
  });
  const [status, setStatus] = useQueryState<AutomationStatus | null>("status", {
    parse: (value): AutomationStatus | null => {
      if (value === "true" || value === "false" || value === "all") {
        return value;
      }
      return null;
    },
    serialize: (value) => value || "all",
    history: "push",
  });
  const [isNewEmailAutomationOpen, setIsNewEmailAutomationOpen] =
    useState(false);

  // Initialize search and status if they're not set and we have initial values
  const effectiveSearch = search;
  const effectiveStatus = status;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useEmailAutomations(
    organizationId,
    effectiveSearch ?? undefined,
    effectiveStatus === "true"
      ? true
      : effectiveStatus === "false"
        ? false
        : undefined,
  );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: AutomationStatus) => {
      await setStatus(value === "all" ? null : value);
    },
    [setStatus],
  );

  // Flatten all pages of data and cast to Email type
  const automations = (data?.pages.flatMap((page) => page?.data ?? []) ??
    []) as EmailAutomation[];
  const count = data?.pages[0]?.count ?? 0;

  // Show loading state during both initial load and navigation
  const showLoading = isLoading || isFetching;

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          <span className="font-normal text-muted-foreground">
            {showLoading ? <Skeleton className="h-7 w-6" /> : count}
          </span>{" "}
          {count === 1 ? "Automation" : "Automations"}
        </h1>
        <Button onClick={() => setIsNewEmailAutomationOpen(true)}>
          New Automation
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={automations}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          const nextPageData = (result.data?.pages[result.data.pages.length - 1]
            ?.data ?? []) as EmailAutomation[];
          return {
            data: nextPageData,
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={effectiveSearch || ""}
        onSearch={handleSearch}
        filterConfig={getAutomationFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: effectiveStatus ?? undefined,
        }}
        searchPlaceholderText="Search by name..."
        isLoading={showLoading || isFetchingNextPage}
      />

      <Dialog
        open={isNewEmailAutomationOpen}
        onOpenChange={setIsNewEmailAutomationOpen}
      >
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Automation
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              What&apos;s the name of your automation? You can always change it
              later.
            </DialogDescription>
          </DialogHeader>

          <NewEmailAutomation
            organizationId={organizationId}
            setIsNewEmailAutomationOpen={setIsNewEmailAutomationOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
