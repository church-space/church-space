"use client";

import { useCallback } from "react";
import DataTable from "../data-table";
import { columns } from "./columns";
import { useQueryState } from "nuqs";
import { getPeopleFilterConfig, type EmailStatus } from "./filters";
import { usePeople } from "@/hooks/use-people";
import { Skeleton } from "@church-space/ui/skeleton";
import { CircleInfo } from "@church-space/ui/icons";
import { Button } from "@church-space/ui/button";

interface PeopleTableProps {
  organizationId: string;
}

export default function PeopleTable({ organizationId }: PeopleTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [emailStatus, setEmailStatus] = useQueryState("emailStatus");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePeople(organizationId, search ?? undefined, emailStatus ?? undefined);

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

  console.log("Table data:", {
    peopleCount: people.length,
    totalCount: count,
    pages: data?.pages.length,
    isFetchingNextPage,
    emailStatus,
    search,
    people,
  });

  return (
    <>
      <div className="mb-5 flex w-full flex-col justify-between gap-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <h1 className="flex items-center gap-1.5 text-xl font-bold md:text-3xl">
            <span className="font-normal text-muted-foreground">
              {isLoading ? <Skeleton className="h-7 w-5" /> : count}
            </span>{" "}
            People
          </h1>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-3 rounded-md border bg-primary/10 p-3 text-sm text-secondary-foreground md:flex-row">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-shrink-0">
              <CircleInfo height={"20"} width={"20"} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-semibold">
                Import Unsubscribed People
              </h3>
              <p className="text-sm">
                Import unsubscribes from a former application (like Mailchimp or
                Constant Contact) in order to not send them emails.{" "}
                <span className="underline">
                  This helps make sure your emails do not end up in
                  people&apos;s spam folders.
                </span>
              </p>
            </div>
          </div>
          <Button className="mr-3 w-full md:w-fit">Import Unsubscribes</Button>
        </div>
        <div className="flex w-full items-center gap-3 rounded-md border bg-muted p-3 text-sm text-secondary-foreground">
          <div className="flex-shrink-0">
            <CircleInfo height={"20"} width={"20"} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              People are set as &quot;Subscribed&quot; to all categories by
              default. Make sure your PCO lists only have the appropriate people
              in them to avoid unsubscribes.
            </p>
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={people}
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
        filterConfig={getPeopleFilterConfig()}
        onFilterChange={{
          emailStatus: handleEmailStatusChange,
        }}
        initialFilters={{
          emailStatus: emailStatus ?? undefined,
        }}
        isLoading={isFetchingNextPage}
      />
    </>
  );
}
