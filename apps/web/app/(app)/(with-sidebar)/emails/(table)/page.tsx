import React, { Suspense } from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import EmailsTable from "@/components/tables/emails/table";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@church-space/supabase/server";
import {
  getEmailsQuery,
  getEmailsCount,
} from "@church-space/supabase/queries/all/get-emails";
import type { EmailStatus } from "@/components/tables/emails/filters";
import type { Email } from "@/components/tables/emails/columns";
import DataTableSkeleton from "@/components/tables/data-table-skeleton";

interface PageProps {
  params: Promise<{ slug?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  // Get the first value if it's an array, or the value itself if it's a string
  const searchValue = Array.isArray(resolvedSearchParams.search)
    ? resolvedSearchParams.search[0]
    : resolvedSearchParams.search;

  const statusValue = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams.status;

  // Parse status to ensure it's a valid EmailStatus
  const status = statusValue as EmailStatus | undefined;
  const validStatus =
    status === "scheduled" ||
    status === "sent" ||
    status === "sending" ||
    status === "draft" ||
    status === "failed"
      ? status
      : undefined;

  const supabase = await createClient();

  // Get initial data
  const { data: emailsData, error } = await getEmailsQuery(
    supabase,
    organizationId,
    {
      start: 0,
      end: 24,
      searchTerm: searchValue,
      status: validStatus,
    },
  );

  // Get total count
  const { count } = await getEmailsCount(supabase, organizationId, {
    searchTerm: searchValue,
    status: validStatus,
  });

  if (error) {
    throw error;
  }

  // Transform the data to match the Email type
  const emails =
    (emailsData?.map((email) => ({
      ...email,
      from_domain: email.from_domain as unknown as { domain: string } | null,
      reply_to_domain: email.reply_to_domain as unknown as {
        domain: string;
      } | null,
    })) as Email[]) ?? [];

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Emails</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6">
        <EmailsTable
          organizationId={organizationId}
          initialData={emails}
          initialCount={count ?? 0}
          initialSearch={searchValue}
          initialStatus={validStatus}
        />
      </div>
    </>
  );
}
