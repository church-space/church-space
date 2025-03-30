"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailCategory } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getEmailCategoryFilterConfig, EmailCategoryStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailCategories } from "@/hooks/use-email-categories";

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
  const [isNewEmailCategoryOpen, setIsNewEmailCategoryOpen] = useState(false);

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
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Email Categories
        </h1>
        <Button onClick={() => setIsNewEmailCategoryOpen(true)}>
          New Email Category
        </Button>
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

      <Dialog
        open={isNewEmailCategoryOpen}
        onOpenChange={setIsNewEmailCategoryOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Category</DialogTitle>
          </DialogHeader>
          <div>Placeholder for NewEmailCategory form</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
