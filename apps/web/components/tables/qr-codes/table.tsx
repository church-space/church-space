"use client";

import { useCallback } from "react";
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
import { Qrcode } from "@church-space/ui/icons";
import NullState from "./null-state";

interface QrCodesTableProps {
  organizationId: string;
}

export default function QrCodesTable({ organizationId }: QrCodesTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [status, setStatus] = useQueryState("status");
  const [isNewQrCodeOpen, setIsNewQrCodeOpen] = useQueryState("newQrCodeOpen", {
    parse: (value) => value === "true",
    serialize: (value) => value?.toString() ?? null,
    history: "push",
  });
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

  const handleNewQrCodeOpen = useCallback(
    (value: boolean) => {
      setIsNewQrCodeOpen(value);
    },
    [setIsNewQrCodeOpen],
  );

  // Flatten all pages of data
  const qrCodes = (data?.pages.flatMap((page) => page.data) ?? []) as QrLink[];

  return (
    <>
      <div className="mb-6 flex w-full items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-3xl font-bold">
          QR Codes
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
        nullState={<NullState onClick={() => setIsNewQrCodeOpen(true)} />}
      />

      <Dialog open={isNewQrCodeOpen ?? false} onOpenChange={setIsNewQrCodeOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-1">
              <Qrcode height={"20"} width={"20"} /> Create New QR Code
            </DialogTitle>
          </DialogHeader>
          <NewQRCode
            organizationId={organizationId}
            setIsNewQRCodeOpen={handleNewQrCodeOpen}
            isSidebar={false}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
