import React from "react";
import {
  getCachedPeopleWithEmails,
  getCachedPeopleCount,
} from "@church-space/supabase/queries/cached/people";
import PeopleTable from "@/components/tables/people/table";
import { convertEmailStatusToQueryParams } from "@/components/tables/people/filters";

const ITEMS_PER_PAGE = 25;

// Server action to fetch data
async function searchPeople(searchTerm: string, emailStatus?: string) {
  "use server";

  // Convert UI emailStatus to database query parameters
  const emailStatusParams = convertEmailStatusToQueryParams(emailStatus);

  const result = await getCachedPeopleWithEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  const countResult = await getCachedPeopleCount({
    searchTerm,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  // If we're filtering by "partially subscribed", we need to filter the results
  // since the database query will return all "subscribed" people
  let filteredData = result?.data ?? [];
  if (emailStatus === "partially subscribed") {
    filteredData = filteredData.filter((person) => {
      const firstEmail = person.people_emails?.[0];
      return (
        firstEmail?.status === "subscribed" &&
        person.email_list_category_unsubscribes?.length > 0
      );
    });
  }

  const count =
    emailStatus === "partially subscribed"
      ? filteredData.length
      : (countResult?.count ?? 0);

  const hasNextPage =
    emailStatus === "partially subscribed"
      ? false // No pagination for filtered results
      : count > ITEMS_PER_PAGE;

  return {
    data: filteredData,
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
  const emailStatus =
    typeof searchParamsValue.emailStatus === "string"
      ? searchParamsValue.emailStatus
      : undefined;

  // Convert UI emailStatus to database query parameters
  const emailStatusParams = convertEmailStatusToQueryParams(emailStatus);

  // Get initial data
  const result = await getCachedPeopleWithEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm: search,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  // If we're filtering by "partially subscribed", we need to filter the results
  let filteredData = result?.data ?? [];
  if (emailStatus === "partially subscribed") {
    filteredData = filteredData.filter((person) => {
      const firstEmail = person.people_emails?.[0];
      return (
        firstEmail?.status === "subscribed" &&
        person.email_list_category_unsubscribes?.length > 0
      );
    });
  }

  // Get total count
  const countResult = await getCachedPeopleCount({
    searchTerm: search,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  const count =
    emailStatus === "partially subscribed"
      ? filteredData.length
      : (countResult?.count ?? 0);

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    // For "partially subscribed", we can't use pagination
    if (emailStatus === "partially subscribed") {
      return { data: [] };
    }

    const result = await getCachedPeopleWithEmails({
      start: from,
      end: to,
      searchTerm: search,
      ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
    });

    return { data: result?.data ?? [] };
  }

  const hasNextPage =
    emailStatus === "partially subscribed"
      ? false // No pagination for filtered results
      : count > ITEMS_PER_PAGE;

  return (
    <>
      <div className="p-6">
        <PeopleTable
          data={filteredData}
          pageSize={ITEMS_PER_PAGE}
          loadMore={loadMore}
          hasNextPage={hasNextPage}
          searchPeople={searchPeople}
        />
      </div>
    </>
  );
}
