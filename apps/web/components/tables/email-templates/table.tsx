"use client";

import { useCallback, useState } from "react";
import DataTable from "../data-table";
import { columns, EmailTemplate } from "./columns";
import { useQueryState } from "nuqs";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import { useEmailTemplates } from "@/hooks/use-email-templates";
import { Skeleton } from "@church-space/ui/skeleton";
import NewEmailTemplate from "@/components/forms/new-email-template";
import { NewEmail as NewEmailIcon } from "@church-space/ui/icons";

interface EmailTemplatesTableProps {
  organizationId: string;
}

export default function EmailTemplatesTable({
  organizationId,
}: EmailTemplatesTableProps) {
  const [search, setSearch] = useQueryState("search");
  const [isNewEmailTemplateOpen, setIsNewEmailTemplateOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
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
      <div className="mb-5 flex w-full flex-col justify-between gap-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <h1 className="flex items-center gap-1.5 text-xl font-bold md:text-2xl lg:text-3xl">
            <span className="font-normal text-muted-foreground">
              {isLoading ? <Skeleton className="h-7 w-5" /> : count}
            </span>{" "}
            Email {count === 1 ? "Template" : "Templates"}
          </h1>
          <div className="flex flex-row items-center gap-2">
            <Button className="hidden md:block" variant="outline">
              Deafult Footer
            </Button>
            <Button onClick={() => setIsNewEmailTemplateOpen(true)}>
              New Template
            </Button>
          </div>
        </div>
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
        isLoading={isFetchingNextPage || isLoading}
      />

      <Dialog
        open={isNewEmailTemplateOpen}
        onOpenChange={setIsNewEmailTemplateOpen}
      >
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Template
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              What&apos;s the name of your template?
            </DialogDescription>
          </DialogHeader>

          <NewEmailTemplate
            organizationId={organizationId}
            setIsNewEmailTemplateOpen={setIsNewEmailTemplateOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
