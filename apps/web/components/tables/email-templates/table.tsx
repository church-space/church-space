"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailTemplate } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailTemplates } from "@/hooks/use-email-templates";
import NewEmailTemplate from "@/components/forms/new-email-template";

interface EmailTemplatesTableProps {
  organizationId: string;
}

export default function EmailTemplatesTable({
  organizationId,
}: EmailTemplatesTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isNewEmailTemplateOpen, setIsNewEmailTemplateOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEmailTemplates(organizationId, search ?? undefined);

  const handleSearch = useCallback(
    async (value: string | null) => {
      await setSearch(value);
    },
    [setSearch],
  );

  // Flatten all pages of data
  const emailTemplates = (data?.pages.flatMap((page) => page.data) ??
    []) as EmailTemplate[];
  const count = data?.pages[0]?.count ?? 0;

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">
          <span className="font-normal text-muted-foreground">{count}</span>{" "}
          Email Templates
        </h1>
        <Button onClick={() => setIsNewEmailTemplateOpen(true)}>
          New Email Template
        </Button>
      </div>
      <DataTable<EmailTemplate>
        columns={columns}
        data={emailTemplates}
        pageSize={25}
        loadMore={async () => {
          const result = await fetchNextPage();
          const newData =
            result.data?.pages[result.data.pages.length - 1]?.data ?? [];
          return {
            data: newData.map((item) => ({
              ...item,
              subject: item.subject || "",
            })) as EmailTemplate[],
          };
        }}
        hasNextPage={hasNextPage}
        searchQuery={search || ""}
        onSearch={handleSearch}
        isLoading={isFetchingNextPage}
      />

      <Dialog
        open={isNewEmailTemplateOpen}
        onOpenChange={setIsNewEmailTemplateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <NewEmailTemplate organizationId={organizationId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
