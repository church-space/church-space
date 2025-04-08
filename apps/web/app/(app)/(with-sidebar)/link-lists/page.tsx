import { LinkListStatus } from "@/components/tables/link-lists/filters";
import LinkListsTable from "@/components/tables/link-lists/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@church-space/supabase/server";
import {
  getAllLinkLists,
  getLinkListsCount,
} from "@church-space/supabase/queries/all/get-all-link-lists";
import { Suspense } from "react";
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

  const visibilityValue = Array.isArray(resolvedSearchParams.visibility)
    ? resolvedSearchParams.visibility[0]
    : resolvedSearchParams.visibility;

  // Parse visibility to ensure it's a valid Emailvisibility
  const visibility = visibilityValue as LinkListStatus | undefined;
  const validvisibility =
    visibility === "all" || visibility === "true" || visibility === "false"
      ? visibility
      : undefined;

  const supabase = await createClient();

  // Get initial data
  const { data: linkListsData, error } = await getAllLinkLists(
    supabase,
    organizationId,
    {
      start: 0,
      end: 24,
      searchTerm: searchValue,
      isPublic:
        validvisibility === "true"
          ? true
          : validvisibility === "false"
            ? false
            : undefined,
    },
  );

  // Get total count
  const { count } = await getLinkListsCount(supabase, organizationId, {
    searchTerm: searchValue,
    isPublic:
      validvisibility === "true"
        ? true
        : validvisibility === "false"
          ? false
          : undefined,
  });

  if (error) {
    throw error;
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
                <BreadcrumbPage>Link Lists</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6">
        <Suspense fallback={<DataTableSkeleton title="Link Lists" />}>
          <LinkListsTable
            organizationId={organizationId}
            initialData={linkListsData ?? []}
            initialCount={count ?? 0}
            initialSearch={searchValue}
            initialVisibility={validvisibility}
          />
        </Suspense>
      </div>
    </>
  );
}
