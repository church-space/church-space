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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 25;

// Server action to fetch data
async function searchEmails(searchTerm: string, status?: string) {
  "use server";

  const result = await getCachedEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm,
    status: status as any,
  });

  const countResult = await getCachedEmailsCount({
    searchTerm,
    status: status as any,
  });

  const count = countResult?.count ?? 0;
  const hasNextPage = count > ITEMS_PER_PAGE;

  return {
    data: result?.data ?? [],
    hasNextPage,
    count,
  };
}

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: PageProps) {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  const searchParamsValue = await searchParams;
  const search =
    typeof searchParamsValue.search === "string"
      ? searchParamsValue.search
      : "";
  const status =
    typeof searchParamsValue.status === "string"
      ? searchParamsValue.status
      : undefined;

  // Get initial data
  const result = await getCachedEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm: search,
    status: status as any,
  });

  // Get total count
  const countResult = await getCachedEmailsCount({
    searchTerm: search,
    status: status as any,
  });

  const count = countResult?.count ?? 0;

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    const result = await getCachedEmails({
      start: from,
      end: to,
      searchTerm: search,
      status: status as any,
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
          organizationId={organizationId}
        />
      </div>
    </>
  );
}
