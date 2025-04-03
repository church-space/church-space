"use client";

import { useEmailCategories } from "@/hooks/use-email-categories";
import { Button } from "@church-space/ui/button";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailCategory } from "./columns";
import { EmailCategoryStatus, getEmailCategoryFilterConfig } from "./filters";

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
        <p className="rounded-md border bg-muted p-3 text-sm text-secondary-foreground">
          Think of Categories as the types of emails you send. For example, you
          might have "General Emails", "Events", "Giving", "Youth", etc. This
          allows people to subscribe to only the types of emails they want. The
          categories that you see here are your List Categories in Planning
          Center People. To send an email to a type of List Category, set the
          category to "public".
        </p>
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
          isPublic: handleStatusChange,
        }}
        initialFilters={{
          isPublic: isPublic || "all",
        }}
        isLoading={isFetchingNextPage}
      />
    </>
  );
}
