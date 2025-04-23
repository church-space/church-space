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
import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, type EmailAutomation } from "./columns";
import { NewEmail as NewEmailIcon } from "@church-space/ui/icons";
import NewEmailAutomation from "../../forms/new-automation";
import { AutomationStatus, getAutomationFilterConfig } from "./filters";
import NullState from "./null-state";

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

  const [isNewEmailAutomationOpen, setIsNewEmailAutomationOpen] = useQueryState(
    "newEmailAutomationOpen",
    {
      parse: (value) => value === "true",
      serialize: (value) => value?.toString() ?? null,
      history: "push",
    },
  );

  // Status filter (active / inactive / all)
  const [status, setStatus] = useQueryState<AutomationStatus>("status", {
    parse: (value): AutomationStatus => {
      if (value === "true" || value === "false" || value === "all") {
        return value;
      }
      return "all";
    },
    serialize: (value) => value,
  });

  const handleStatusChange = useCallback(
    async (value: AutomationStatus) => {
      await setStatus(value === "all" ? null : value);
    },
    [setStatus],
  );

  // Initialize search and status if they're not set and we have initial values
  const effectiveSearch = search;

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
    status === "true" ? true : status === "false" ? false : undefined,
  );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // Flatten all pages of data and cast to Email type
  const automations = (data?.pages.flatMap((page) => page?.data ?? []) ??
    []) as EmailAutomation[];

  // Show loading state during both initial load and navigation
  const showLoading = isLoading || isFetching;

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          Automations
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
        searchPlaceholderText="Search by name..."
        isLoading={showLoading || isFetchingNextPage}
        filterConfig={getAutomationFilterConfig()}
        onFilterChange={{
          is_active: handleStatusChange,
        }}
        initialFilters={{
          is_active: status ?? "all",
        }}
        nullState={
          <NullState onClick={() => setIsNewEmailAutomationOpen(true)} />
        }
      />

      <Dialog
        open={isNewEmailAutomationOpen ?? false}
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
