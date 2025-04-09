"use client";

import { useEmailCategories } from "@/hooks/use-email-categories";
import { Button } from "@church-space/ui/button";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, EmailCategory } from "./columns";
import { EmailCategoryStatus, getEmailCategoryFilterConfig } from "./filters";
import { CircleInfo } from "@church-space/ui/icons";

interface EmailCategoriesTableProps {
  organizationId: string;
}

export default function EmailCategoriesTable({
  organizationId,
}: EmailCategoriesTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isPublic, setIsPublic] = useQueryState<EmailCategoryStatus>(
    "isPublic",
    {
      parse: (value) => {
        if (value === "true" || value === "false" || value === "all") {
          return value;
        }
        return "all";
      },
      serialize: (value) => value,
    },
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailCategories(
      organizationId,
      search ?? undefined,
      isPublic === "true" ? true : isPublic === "false" ? false : undefined,
    );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: string) => {
      await setIsPublic(
        value === "all" ? null : (value as EmailCategoryStatus),
      );
    },
    [setIsPublic],
  );

  // Flatten all pages of data
  const categories = (data?.pages.flatMap((page) => page.data) ??
    []) as EmailCategory[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="mb-5 flex w-full flex-col items-center justify-between gap-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">
            <span className="font-normal text-muted-foreground">{count}</span>{" "}
            Email {count === 1 ? "Category" : "Categories"}
          </h1>
          <Link
            href="https://people.planningcenteronline.com/list_categories"
            target="_blank"
          >
            <Button>Manage in PCO</Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-muted p-3 text-sm text-secondary-foreground">
          <div className="flex-shrink-0">
            <CircleInfo height={"20"} width={"20"} />
          </div>
          <p>
            Categories are the types of emails you send—like
            &quot;General,&quot; &quot;Events,&quot; or &quot;Students.&quot;
            They let people subscribe to what they care about, reducing full
            unsubscribes. These categories are created through your List
            Categories in Planning Center People. To make a category emailable,
            set it to &quot;public.&quot;
          </p>
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
        filterConfig={getEmailCategoryFilterConfig()}
        onFilterChange={{
          is_public: handleStatusChange,
        }}
        initialFilters={{
          is_public: isPublic || "all",
        }}
        isLoading={isFetchingNextPage || isLoading}
      />
    </>
  );
}
