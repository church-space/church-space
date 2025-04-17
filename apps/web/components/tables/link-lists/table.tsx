"use client";

import { useCallback } from "react";
import DataTable from "../data-table";
import { columns, LinkList } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { LinkListStatus, LINK_LIST_STATUS_OPTIONS } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useLinkLists } from "@/hooks/use-link-lists";
import NewLinkList from "@/components/forms/new-link-list";
import { LinkFilled } from "@church-space/ui/icons";

interface LinkListsTableProps {
  organizationId: string;
}

export default function LinkListsTable({
  organizationId,
}: LinkListsTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [visibility, setVisibility] = useQueryState<LinkListStatus>(
    "visibility",
    {
      parse: (value): LinkListStatus => {
        if (value === "true" || value === "false" || value === "all") {
          return value;
        }
        return "all";
      },
      serialize: (value) => value,
    },
  );
  const [isNewLinkListOpen, setIsNewLinkListOpen] = useQueryState(
    "newLinkListOpen",
    {
      parse: (value) => value === "true",
      serialize: (value) => value?.toString() ?? null,
      history: "push",
    },
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLinkLists(
      organizationId,
      search ?? undefined,
      visibility === "true" ? true : visibility === "false" ? false : undefined,
    );

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: LinkListStatus) => {
      await setVisibility(value === "all" ? null : value);
    },
    [setVisibility],
  );

  // Flatten all pages of data
  const linkLists = (data?.pages.flatMap((page) => page.data) ??
    []) as LinkList[];

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          Link Pages
        </h1>
        <Button onClick={() => setIsNewLinkListOpen(true)}>
          New Link Page
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
        filterConfig={{
          is_public: {
            type: "select",
            options: LINK_LIST_STATUS_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            })),
            defaultValue: "all",
            label: "Visibility",
          },
        }}
        onFilterChange={{
          is_public: handleStatusChange,
        }}
        initialFilters={{
          is_public: visibility ?? "all",
        }}
        searchPlaceholderText="Search by name or URL slug..."
        isLoading={isLoading || isFetchingNextPage}
      />

      <Dialog
        open={isNewLinkListOpen ?? false}
        onOpenChange={setIsNewLinkListOpen}
      >
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-1">
              <LinkFilled height={"20"} width={"20"} /> Create New Link Page
            </DialogTitle>
          </DialogHeader>
          <NewLinkList
            organizationId={organizationId}
            setIsNewLinkListOpen={setIsNewLinkListOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
