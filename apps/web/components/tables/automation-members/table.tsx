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
  organizationId: string;
}

export default function AutomationMembersTable({
  organizationId,
}: AutomationMembersTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isNewLinkListOpen, setIsNewLinkListOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailAutomationMembers(Number(organizationId));

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
