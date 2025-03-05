"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "../data-table";
import { columns, type Person } from "./columns";
import { useQueryState } from "nuqs";
import { getPeopleFilterConfig, type EmailStatus } from "./filters";

interface PeopleTableProps {
  data: Person[];
  pageSize?: number;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: Person[] }>;
  hasNextPage?: boolean;
  searchPeople: (
    searchTerm: string,
    emailStatus?: string,
  ) => Promise<{
    data: Person[];
    hasNextPage: boolean;
    count: number;
  }>;
}

export default function PeopleTable({
  data: initialData,
  pageSize,
  loadMore: initialLoadMore,
  hasNextPage: initialHasNextPage,
  searchPeople,
}: PeopleTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [emailStatus, setEmailStatus] = useQueryState("emailStatus");
  const [data, setData] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [count, setCount] = useState(0);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
      const result = await searchPeople(value ?? "", emailStatus ?? undefined);
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchPeople, setSearch, emailStatus],
  );

  const handleEmailStatusChange = useCallback(
    async (value: EmailStatus) => {
      await setEmailStatus(value === "all" ? null : value);
      const result = await searchPeople(
        search ?? "",
        value === "all" ? undefined : value,
      );
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchPeople, setEmailStatus, search],
  );

  // Initial load
  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      try {
        const result = await searchPeople(
          search ?? "",
          emailStatus ?? undefined,
        );
        if (isCurrent) {
          setData(result.data);
          setHasNextPage(result.hasNextPage);
          setCount(result.count);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    }

    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [search, emailStatus, searchPeople]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        <span className="font-normal text-muted-foreground">{count}</span>{" "}
        People
      </h1>
      <DataTable
        columns={columns}
        data={data}
        pageSize={pageSize}
        loadMore={initialLoadMore}
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
      />
    </>
  );
}
