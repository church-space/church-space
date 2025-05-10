"use client";

import { usePeople } from "@/hooks/use-people";
import { useSubscribedPeopleCount } from "@/hooks/use-subscribed-people-count";
import { useUser } from "@/stores/use-user";
import { Button } from "@church-space/ui/button";
import { CircleInfo } from "@church-space/ui/icons";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, type Person } from "./columns";
import NullState from "./null-state";

interface PeopleTableProps {
  organizationId: string;
}

export default function PeopleTable({ organizationId }: PeopleTableProps) {
  const [search, setSearch] = useQueryState("search");

  const { role } = useUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePeople(organizationId, search ?? undefined);

  const {
    data: subscribedPeopleCount,
    isLoading: subscribedPeopleCountLoading,
  } = useSubscribedPeopleCount(organizationId);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // Flatten all pages of data
  const people = (data?.pages.flatMap((page) => page.data) ?? []) as Person[];

  return (
    <>
      <div className="mb-5 flex w-full flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-full flex-col items-baseline md:flex-row md:gap-2">
            <h1 className="flex items-center text-xl font-bold md:text-3xl">
              People
            </h1>
            {!subscribedPeopleCountLoading && (
              <p className="text-lg font-medium text-muted-foreground md:text-2xl md:font-semibold">
                {subscribedPeopleCount?.count} subscribed
              </p>
            )}
          </div>
          {role === "owner" && (
            <div className="flex w-full flex-row items-center justify-end">
              <Link href={`/people/import`}>
                <Button className="w-fit gap-1">
                  Import <span className="hidden md:inline">Contacts</span>
                </Button>
              </Link>
            </div>
          )}
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
      <DataTable<Person>
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
        searchPlaceholderText="Search by name or email..."
        isLoading={isLoading || isFetchingNextPage}
        nullState={<NullState onClick={() => {}} />}
      />
    </>
  );
}
