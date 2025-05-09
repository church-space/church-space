import EmailsTable from "@/components/tables/emails/table";
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
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emails",
};

function EmailsContent({ organizationId }: { organizationId: string }) {
  return (
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
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
        <EmailsTable organizationId={organizationId} />
      </div>
    </div>
  );
}

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  // Get user details to verify organization membership
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  // If no user or no organization membership, redirect to onboarding
  if (!user || !user.organizationMembership) {
    redirect("/onboarding");
  }

  // If no organization ID in cookies but user has organization membership,
  // redirect to set the cookie and then come back
  if (!organizationId && user.organizationMembership.organization_id) {
    // Redirect to a route handler that will set the cookie and redirect back
    redirect(
      `/api/set-organization?id=${user.organizationMembership.organization_id}&redirectTo=/emails`,
    );
  }

  // If no organization ID at all, redirect to onboarding
  if (!organizationId) {
    redirect("/onboarding");
  }

  return <EmailsContent organizationId={organizationId} />;
}
