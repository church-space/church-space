import DomainManagement from "@/components/domains/domain-managament";
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";
import { createClient } from "@church-space/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Domains",
};

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    return <div>Not logged in</div>;
  }
  if (!organizationId) {
    return <div>No organization selected</div>;
  }

  const domains = await getDomainsQuery(supabase, organizationId);

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/settings" className="hidden md:block">
                <BreadcrumbItem>Settings</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Domains</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-0">
          <h2 className="pl-1 text-2xl font-bold">Domains</h2>
          <p className="mb-4 pl-1 text-sm text-muted-foreground">
            Manage the domains that are used to send emails.
          </p>
          <DomainManagement
            organizationId={organizationId}
            initialDomains={domains?.data || []}
          />
        </div>
      </div>
    </div>
  );
}
