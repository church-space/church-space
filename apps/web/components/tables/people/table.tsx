"use client";

import { useEffect, useState, useCallback } from "react";
import DataTable from "../data-table";
import { columns, type Person } from "./columns";
import { useQueryState } from "nuqs";

interface PeopleTableProps {
  data: Person[];
  pageSize?: number;
  loadMore?: (params: {
    from: number;
    to: number;
  }) => Promise<{ data: Person[] }>;
  hasNextPage?: boolean;
  searchPeople: (searchTerm: string) => Promise<{
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
  const [data, setData] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [count, setCount] = useState(0);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
      const result = await searchPeople(value ?? "");
      setData(result.data);
      setHasNextPage(result.hasNextPage);
      setCount(result.count);
    },
    [searchPeople, setSearch],
  );

  // Initial load
  useEffect(() => {
    let isCurrent = true;

    async function fetchData() {
      try {
        const result = await searchPeople(search ?? "");
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

    console.log(data);

    return () => {
      isCurrent = false;
    };
  }, [search, searchPeople]);

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
      />
    </>
  );
}
