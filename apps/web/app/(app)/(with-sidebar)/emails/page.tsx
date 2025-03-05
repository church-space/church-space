import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import {
  getCachedEmails,
  getCachedEmailsCount,
} from "@church-space/supabase/queries/cached/emails";
import EmailsTable from "@/components/tables/emails/table";

const ITEMS_PER_PAGE = 25;

// Server action to fetch data
async function searchEmails(searchTerm: string) {
  "use server";

  const result = await getCachedEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm,
  });

  const countResult = await getCachedEmailsCount({
    searchTerm,
  });

  const count = countResult?.count ?? 0;
  const hasNextPage = count > ITEMS_PER_PAGE;

  return {
    data: result?.data ?? [],
    hasNextPage,
    count,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchParamsValue = await Promise.resolve(searchParams);
  const search =
    typeof searchParamsValue.search === "string"
      ? searchParamsValue.search
      : "";

  // Get initial data
  const result = await getCachedEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm: search,
  });

  // Get total count
  const countResult = await getCachedEmailsCount({
    searchTerm: search,
  });

  const count = countResult?.count ?? 0;

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    const result = await getCachedEmails({
      start: from,
      end: to,
      searchTerm: search,
    });

    return { data: result?.data ?? [] };
  }

  const hasNextPage = count > ITEMS_PER_PAGE;

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Hillsong Church Online</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Emails</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6">
        <EmailsTable
          data={result?.data ?? []}
          pageSize={ITEMS_PER_PAGE}
          loadMore={loadMore}
          hasNextPage={hasNextPage}
          searchEmails={searchEmails}
        />
      </div>
    </>
  );
}
