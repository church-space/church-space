"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, type QrLink } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import { getQrCodeFilterConfig, type QrCodeStatus } from "./filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useQrLinks } from "@/hooks/use-qr-codes";
import NewQRCode from "@/components/forms/new-qr-code";
import { Skeleton } from "@church-space/ui/skeleton";
interface QrCodesTableProps {
  organizationId: string;
}

export default function QrCodesTable({ organizationId }: QrCodesTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [status, setStatus] = useQueryState("status");
  const [isNewQrCodeOpen, setIsNewQrCodeOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useQrLinks(organizationId, search ?? undefined, status ?? undefined);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  const handleStatusChange = useCallback(
    async (value: QrCodeStatus) => {
      await setStatus(value === "all" ? null : value);
    },
    [setStatus],
  );

  // Flatten all pages of data
  const qrCodes = (data?.pages.flatMap((page) => page.data) ?? []) as QrLink[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          <span className="font-normal text-muted-foreground">
            {isLoading ? <Skeleton className="h-7 w-6" /> : count}
          </span>{" "}
          {count === 1 ? "QR Code" : "QR Codes"}
        </h1>
        <Button onClick={() => setIsNewQrCodeOpen(true)}>New QR Code</Button>
      </div>
      <DataTable<QrLink>
        columns={columns}
        data={qrCodes}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          const newData =
            result.data?.pages[result.data.pages.length - 1]?.data ?? [];
          // Ensure the data matches the QrLink type by asserting the status
          return {
            data: newData.map((item) => ({
              ...item,
              status: item.status || "inactive", // Default to inactive if status is null
            })) as QrLink[],
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
        filterConfig={getQrCodeFilterConfig()}
        onFilterChange={{
          status: handleStatusChange,
        }}
        initialFilters={{
          status: status ?? undefined,
        }}
        isLoading={isFetchingNextPage || isLoading}
      />

      <Dialog open={isNewQrCodeOpen} onOpenChange={setIsNewQrCodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New QR Code</DialogTitle>
          </DialogHeader>
          <NewQRCode organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
