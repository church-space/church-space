"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailAutomation } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getAutomationFilterConfig, AutomationStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailAutomations } from "@/hooks/use-email-automations";
import NewAutomation from "@/components/forms/new-automation";

interface EmailAutomationsTableProps {
  organizationId: string;
}

export default function EmailAutomationsTable({
  organizationId,
}: EmailAutomationsTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isActive, setIsActive] = useQueryState<AutomationStatus>("isActive", {
    parse: (value) => {
      if (value === "true" || value === "false" || value === "all") {
        return value;
      }
      return "all";
    },
    serialize: (value) => value,
  });
  const [isNewEmailAutomationOpen, setIsNewEmailAutomationOpen] =
    useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEmailAutomations(
      organizationId,
      search ?? undefined,
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: string) => {
      await setIsActive(value === "all" ? null : (value as AutomationStatus));
    },
    [setIsActive],
  );

  // Flatten all pages of data
  const automations = (data?.pages.flatMap((page) => page.data) ??
    []) as EmailAutomation[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Email Automations
        </h1>
        <Button onClick={() => setIsNewEmailAutomationOpen(true)}>
          New Email Automation
        </Button>
      </div>
      <DataTable<EmailAutomation>
        columns={columns}
        data={automations}
        pageSize={25}
        loadMore={async ({ from, to }) => {
          const result = await fetchNextPage();
          const newData =
            result.data?.pages[result.data.pages.length - 1]?.data ?? [];
          // Ensure the data matches the EmailAutomation type by asserting non-null trigger_type
          return {
            data: newData.map((item) => ({
              ...item,
              trigger_type: item.trigger_type || "", // Convert null to empty string to match type
            })) as EmailAutomation[],
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
        filterConfig={getAutomationFilterConfig()}
        onFilterChange={{
          isActive: handleStatusChange,
        }}
        initialFilters={{
          isActive: isActive || "all",
        }}
        isLoading={isFetchingNextPage}
      />

      <Dialog
        open={isNewEmailAutomationOpen}
        onOpenChange={setIsNewEmailAutomationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Automation</DialogTitle>
          </DialogHeader>
          <NewAutomation organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
