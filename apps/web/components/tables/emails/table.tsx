"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "../data-table";
import { columns, type Email } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getEmailFilterConfig, type EmailStatus } from "./filters";

interface EmailsTableProps {
  data: Email[];
  pageSize?: number;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: Email[] }>;
  hasNextPage?: boolean;
  searchEmails: (
    searchTerm: string,
    status?: string,
  ) => Promise<{
    data: Email[];
    hasNextPage: boolean;
    count: number;
  }>;
}

export default function EmailsTable({
  data: initialData,
  pageSize,
  loadMore: initialLoadMore,
  hasNextPage: initialHasNextPage,
  searchEmails,
}: EmailsTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [status, setStatus] = useQueryState("status");
  const [data, setData] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [count, setCount] = useState(0);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
      const result = await searchEmails(value ?? "", status ?? undefined);
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchEmails, setSearch, status],
  );

  const handleStatusChange = useCallback(
    async (value: EmailStatus) => {
      await setStatus(value === "all" ? null : value);
      const result = await searchEmails(
        search ?? "",
        value === "all" ? undefined : value,
      );
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchEmails, setStatus, search],
  );

  // Initial load
  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      try {
        const result = await searchEmails(search ?? "", status ?? undefined);
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
  }, [search, status, searchEmails]);

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Emails
        </h1>
        <Button>New Email</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        pageSize={pageSize}
        loadMore={initialLoadMore}
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
      />
    </>
  );
}
