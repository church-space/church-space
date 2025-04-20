"use client";

import { useEmailCategories } from "@/hooks/use-email-categories";
import { Button } from "@church-space/ui/button";
import { useQueryState } from "nuqs";
import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, EmailCategory } from "./columns";
import { CircleInfo } from "@church-space/ui/icons";

interface EmailCategoriesTableProps {
  organizationId: string;
}

export default function EmailCategoriesTable({
  organizationId,
}: EmailCategoriesTableProps) {
  const [search, setSearch] = useQueryState("search");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailCategories(organizationId, search ?? undefined);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // Flatten all pages of data
  const categories = (data?.pages.flatMap((page) => page.data) ??
    []) as EmailCategory[];

  return (
    <>
      <div className="mb-5 flex w-full flex-col justify-between gap-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <h1 className="flex items-center gap-1.5 text-xl font-bold md:text-3xl">
            Email Categories
          </h1>

          <a
            href="https://people.planningcenteronline.com/list_categories"
            target="_blank"
          >
            <Button>Manage in PCO</Button>
          </a>
        </div>
        <div className="flex w-full items-center gap-3 rounded-md border bg-muted p-3 text-sm text-secondary-foreground">
          <div className="flex-shrink-0">
            <CircleInfo height={"20"} width={"20"} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              Categories help people subscribe to the types of emails they care
              about (like &quot;General,&quot; &quot;Events,&quot; or
              &quot;Students&quot;). This reduces full unsubscribes. By default,
              new people are subscribed to all categories, so make sure your
              lists in PCO are well defined for the people you want to email.
            </p>
          </div>
        </div>
      </div>
      <DataTable<EmailCategory>
        columns={columns}
        data={categories}
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
        searchPlaceholderText="Search by name..."
        isLoading={isFetchingNextPage || isLoading}
      />
    </>
  );
}
