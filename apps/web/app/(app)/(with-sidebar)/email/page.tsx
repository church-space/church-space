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

export default async function Page({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  // Parse status to ensure it's a valid EmailStatus
  const status = searchParams.status as EmailStatus | undefined;
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
      searchTerm: searchParams.search,
      status: validStatus,
    },
  );

  // Get total count
  const { count } = await getEmailsCount(supabase, organizationId, {
    searchTerm: searchParams.search,
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
          organizationId={organizationId}
          initialData={emails}
          initialCount={count ?? 0}
          initialSearch={searchParams.search}
          initialStatus={validStatus}
        />
      </div>
    </>
  );
}
