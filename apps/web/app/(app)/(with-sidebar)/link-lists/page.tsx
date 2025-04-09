"use client";

import LinkListsTable from "@/components/tables/link-lists/table";
import { useUser } from "@/stores/use-user";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { redirect } from "next/navigation";

export default function Page() {
  const { organizationId } = useUser();

  if (!organizationId) {
    redirect("/onboarding");
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 rounded-t-lg bg-background">
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
        <LinkListsTable organizationId={organizationId} />
      </div>
    </div>
  );
}
