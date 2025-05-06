import { getPcoConnection } from "@church-space/supabase/queries/all/get-pco-connection";
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
import ClientPage, { Address } from "./client-page";
import { getOrgDetailsQuery } from "@church-space/supabase/queries/all/get-org-details";
import Link from "next/link";

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

  const data = await Promise.all([
    getPcoConnection(supabase, organizationId),
    getOrgDetailsQuery(supabase, organizationId),
  ]);
  const pcoConnection = data[0].data || null;
  const orgDetails = data[1].data;

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
                <BreadcrumbPage>Organization</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <ClientPage
        organizationId={organizationId}
        pcoConnection={pcoConnection}
        orgName={orgDetails?.name}
        defaultEmail={orgDetails?.default_email || undefined}
        defaultEmailDomain={orgDetails?.default_email_domain || undefined}
        address={orgDetails?.address as Address | undefined}
      />
    </div>
  );
}
