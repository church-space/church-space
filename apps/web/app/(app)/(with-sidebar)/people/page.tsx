import React from "react";
import {
  getCachedPeopleWithEmails,
  getCachedPeopleCount,
} from "@church-space/supabase/queries/cached/people";
import PeopleTable from "@/components/tables/people/table";

const ITEMS_PER_PAGE = 25;

// Server action to fetch data
async function searchPeople(searchTerm: string) {
  "use server";

  const result = await getCachedPeopleWithEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm,
  });

  const countResult = await getCachedPeopleCount({
    searchTerm,
  });

  const count = countResult?.count ?? 0;
  const hasNextPage = count > ITEMS_PER_PAGE;

  return {
    data: result?.data ?? [],
    hasNextPage,
    count,
  };
}

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const searchParamsValue = await searchParams;
  const search =
    typeof searchParamsValue.search === "string"
      ? searchParamsValue.search
      : "";

  // Get initial data
  const result = await getCachedPeopleWithEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm: search,
  });

  // Get total count
  const countResult = await getCachedPeopleCount({
    searchTerm: search,
  });

  const count = countResult?.count ?? 0;

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    const result = await getCachedPeopleWithEmails({
      start: from,
      end: to,
      searchTerm: search,
    });

    return { data: result?.data ?? [] };
  }

  const hasNextPage = count > ITEMS_PER_PAGE;

  // Add a script tag with the initial data
  const initialData = {
    data: result?.data ?? [],
    hasNextPage,
    count,
  };

  return (
    <>
      <script
        id="initial-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(initialData),
        }}
      />
      <div className="p-6">
        <PeopleTable
          data={result?.data ?? []}
          pageSize={ITEMS_PER_PAGE}
          loadMore={loadMore}
          hasNextPage={hasNextPage}
          searchPeople={searchPeople}
        />
      </div>
    </>
  );
}
