import React from "react";
import {
  getCachedPeopleWithEmails,
  getCachedPeopleCount,
} from "@church-space/supabase/queries/cached/people";
import PeopleTable from "@/components/tables/people/table";
import { convertEmailStatusToQueryParams } from "@/components/tables/people/filters";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";

const ITEMS_PER_PAGE = 25;

// Server action to fetch data
async function searchPeople(searchTerm: string, emailStatus?: string) {
  "use server";

  // Convert UI emailStatus to database query parameters
  const emailStatusParams = convertEmailStatusToQueryParams(emailStatus);

  const result = await getCachedPeopleWithEmails({
    start: 0,
    end: ITEMS_PER_PAGE - 1,
    searchTerm,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  const countResult = await getCachedPeopleCount({
    searchTerm,
    ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
  });

  // If we're filtering by "partially subscribed", we need to filter the results
  // since the database query will return all "subscribed" people
  let filteredData = result?.data ?? [];
  if (emailStatus === "partially subscribed") {
    filteredData = filteredData.filter((person) => {
      const firstEmail = person.people_emails?.[0];
      return (
        firstEmail?.status === "subscribed" &&
        person.email_list_category_unsubscribes?.length > 0
      );
    });
  }

  const count =
    emailStatus === "partially subscribed"
      ? filteredData.length
      : (countResult?.count ?? 0);

  const hasNextPage =
    emailStatus === "partially subscribed"
      ? false // No pagination for filtered results
      : count > ITEMS_PER_PAGE;

  return {
    data: filteredData,
    hasNextPage,
    count,
  };
}

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>People</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6">
        <PeopleTable organizationId={organizationId} />
      </div>
    </>
  );
}
