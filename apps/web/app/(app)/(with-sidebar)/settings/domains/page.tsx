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
import DomainManagement from "@/components/domains/domain-managament";
import { getCachedDomains } from "@church-space/supabase/queries/cached/domains";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

export default async function Page() {
  // Disable caching for this page
  unstable_noStore();

  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  const domains = await getCachedDomains(organizationId);

  console.log("Domains fetched for organization:", organizationId);
  console.log("Domains data:", domains?.data || []);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Domains</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Domains</h1>
        <p className="text-sm text-muted-foreground">
          Manage your domains and DNS records.
        </p>
        <DomainManagement
          organizationId={organizationId}
          initialDomains={domains?.data || []}
        />
      </div>
    </>
  );
}
