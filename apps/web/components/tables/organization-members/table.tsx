"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, OrganizationMember } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getMemberFilterConfig, MemberRole } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useOrganizationMembers } from "@/hooks/use-organization-members";

interface OrganizationMembersTableProps {
  organizationId: string;
}

export default function OrganizationMembersTable({
  organizationId,
}: OrganizationMembersTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [role, setRole] = useQueryState<MemberRole>("role", {
    parse: (value) => {
      if (value === "owner" || value === "admin" || value === "all") {
        return value;
      }
      return "all";
    },
    serialize: (value) => value,
  });
  const [isNewOrganizationMemberOpen, setIsNewOrganizationMemberOpen] =
    useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOrganizationMembers(
      organizationId,
      role === "all" ? undefined : (role as "owner" | "admin" | undefined),
    );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: string) => {
      await setRole(value === "all" ? null : (value as MemberRole));
    },
    [setRole],
  );

  // Flatten all pages of data
  const members = (data?.pages.flatMap((page) => page.data) ??
    []) as OrganizationMember[];

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">Organization Members</h1>
        <Button onClick={() => setIsNewOrganizationMemberOpen(true)}>
          New Organization Member
        </Button>
      </div>
      <DataTable<OrganizationMember>
        columns={columns}
        data={members}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          const newData =
            result.data?.pages[result.data.pages.length - 1]?.data ?? [];
          // Ensure the data matches the OrganizationMember type by asserting the role
          return {
            data: newData.map((item) => ({
              ...item,
              role: item.role as "owner" | "admin", // We know these are the only valid values
            })) as OrganizationMember[],
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
        filterConfig={getMemberFilterConfig()}
        onFilterChange={{
          role: handleStatusChange,
        }}
        initialFilters={{
          role: role || "all",
        }}
        isLoading={isFetchingNextPage}
      />

      <Dialog
        open={isNewOrganizationMemberOpen}
        onOpenChange={setIsNewOrganizationMemberOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization Member</DialogTitle>
          </DialogHeader>
          <div>Placeholder for NewOrganizationMember form</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
