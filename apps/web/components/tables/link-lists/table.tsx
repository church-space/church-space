"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, LinkList } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getLinkListFilterConfig, LinkListStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useLinkLists } from "@/hooks/use-link-lists";
import NewLinkList from "@/components/forms/new-link-list";

interface LinkListsTableProps {
  organizationId: string;
}

export default function LinkListsTable({
  organizationId,
}: LinkListsTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isPublic, setIsPublic] = useQueryState<LinkListStatus>("isPublic", {
    parse: (value) => {
      if (value === "true" || value === "false" || value === "all") {
        return value;
      }
      return "all";
    },
    serialize: (value) => value,
  });
  const [isNewLinkListOpen, setIsNewLinkListOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useLinkLists(
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
      await setIsPublic(value === "all" ? null : (value as LinkListStatus));
    },
    [setIsPublic],
  );

  // Flatten all pages of data
  const linkLists = (data?.pages.flatMap((page) => page.data) ??
    []) as LinkList[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Link Lists
        </h1>
        <Button onClick={() => setIsNewLinkListOpen(true)}>
          New Link List
        </Button>
      </div>
      <DataTable<LinkList>
        columns={columns}
        data={linkLists}
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
        filterConfig={getLinkListFilterConfig()}
        onFilterChange={{
          isPublic: handleStatusChange,
        }}
        initialFilters={{
          isPublic: isPublic || "all",
        }}
        isLoading={isFetchingNextPage}
      />

      <Dialog open={isNewLinkListOpen} onOpenChange={setIsNewLinkListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Link List</DialogTitle>
          </DialogHeader>
          <NewLinkList organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
