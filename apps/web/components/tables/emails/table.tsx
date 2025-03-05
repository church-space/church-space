"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "../data-table";
import { columns, type Email } from "./columns";
import { useQueryState } from "nuqs";

interface EmailsTableProps {
  data: Email[];
  pageSize?: number;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: Email[] }>;
  hasNextPage?: boolean;
  searchEmails: (searchTerm: string) => Promise<{
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
  const [data, setData] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [count, setCount] = useState(0);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
      const result = await searchEmails(value ?? "");
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchEmails, setSearch],
  );

  // Initial load
  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      try {
        const result = await searchEmails(search ?? "");
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
  }, [search, searchEmails]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        <span className="font-normal text-muted-foreground">{count}</span>{" "}
        Emails
      </h1>
      <DataTable
        columns={columns}
        data={data}
        initialSorting={[{ id: "created_at", desc: true }]}
        pageSize={pageSize}
        loadMore={initialLoadMore}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
      />
    </>
  );
}
