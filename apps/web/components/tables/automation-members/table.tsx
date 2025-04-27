"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailAutomationMember } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailAutomationMembers } from "@/hooks/use-email-automation-members";
import NullState from "./null-state";

interface AutomationMembersTableProps {
  automationId: number;
}

export default function AutomationMembersTable({
  automationId,
}: AutomationMembersTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isNewLinkListOpen, setIsNewLinkListOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailAutomationMembers(automationId);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // Filter the data based on step status
  const filteredMembers =
    data?.pages.flatMap((page) => page.data) ?? ([] as EmailAutomationMember[]);
  const count = filteredMembers.length;

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">
            <span className="font-normal text-muted-foreground">{count}</span>{" "}
            Automation Members
          </h1>
          <p className="text-sm text-muted-foreground">
            Note: a person can only go through the automation once.
          </p>
        </div>

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
        isLoading={isFetchingNextPage || isLoading}
        nullState={<NullState onClick={() => {}} />}
      />

      <Dialog open={isNewLinkListOpen} onOpenChange={setIsNewLinkListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Link Page</DialogTitle>
          </DialogHeader>
          <div>Placeholder for NewLinkList form</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
