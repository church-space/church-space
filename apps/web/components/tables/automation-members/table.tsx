"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailAutomationMember } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getStepFilterConfig, StepStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailAutomationMembers } from "@/hooks/use-email-automation-members";

interface AutomationMembersTableProps {
  organizationId: string;
}

export default function AutomationMembersTable({
  organizationId,
}: AutomationMembersTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [status, setStatus] = useQueryState<StepStatus>("status", {
    parse: (value) => {
      if (value === "waiting" || value === "completed" || value === "all") {
        return value;
      }
      return "all";
    },
    serialize: (value) => value,
  });
  const [isNewLinkListOpen, setIsNewLinkListOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEmailAutomationMembers(Number(organizationId), status || "all");

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: string) => {
      await setStatus(value === "all" ? null : (value as StepStatus));
    },
    [setStatus],
  );

  // Filter the data based on step status
  const filteredMembers =
    data?.pages.flatMap((page) => page.data) ?? ([] as EmailAutomationMember[]);
  const count = filteredMembers.length;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Automation Members
        </h1>
        <Button onClick={() => setIsNewLinkListOpen(true)}>
          New Automation Member
        </Button>
      </div>
      <DataTable<EmailAutomationMember>
        columns={columns}
        data={filteredMembers}
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
        filterConfig={getStepFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: status || "all",
        }}
        isLoading={isFetchingNextPage}
      />

      <Dialog open={isNewLinkListOpen} onOpenChange={setIsNewLinkListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Link List</DialogTitle>
          </DialogHeader>
          <div>Placeholder for NewLinkList form</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
