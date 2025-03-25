"use client";

import { useCallback } from "react";
import DataTable from "../data-table";
import { columns } from "./columns";
import { useQueryState } from "nuqs";
import { getPeopleFilterConfig, type EmailStatus } from "./filters";
import { usePeople } from "@/hooks/use-people";

interface PeopleTableProps {
  organizationId: string;
}

export default function PeopleTable({ organizationId }: PeopleTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [emailStatus, setEmailStatus] = useQueryState("emailStatus");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePeople(
    organizationId,
    search ?? undefined,
    emailStatus ?? undefined,
  );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleEmailStatusChange = useCallback(
    async (value: EmailStatus) => {
      await setEmailStatus(value === "all" ? null : value);
    },
    [setEmailStatus],
  );

  // Flatten all pages of data
  const people = data?.pages.flatMap((page) => page.data) ?? [];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        <span className="font-normal text-muted-foreground">{count}</span>{" "}
        People
      </h1>
      <DataTable
        columns={columns}
        data={people}
        pageSize={25}
        loadMore={async ({ from, to }) => {
          await fetchNextPage();
          return { data: [] }; // Data will be handled by React Query
        }}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
        filterConfig={getPeopleFilterConfig()}
        onFilterChange={{
          emailStatus: handleEmailStatusChange,
        }}
        initialFilters={{
          emailStatus: emailStatus ?? undefined,
        }}
        onLoadingStateChange={(loading) => {
          if (loading && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
      />
    </>
  );
}
