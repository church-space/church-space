import InitUser from "@/stores/init-user";
import InitPco from "@/stores/init-pco";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HelpMenu from "@/components/sidebar/help-menu";
import { ReactQueryProvider } from "@/components/providers/react-query";
import { cookies } from "next/headers";
import { setOrgCookie } from "@/actions/set-org-cookie";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const cookieStore = await cookies();
  const orgId = cookieStore.get("organizationId");

  if (!session.data.session) {
    return redirect("/login");
  }

  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  if (!user.organizationMembership) {
    return redirect("/onboarding");
  }

  if (
    user.userDetails?.first_name === null ||
    user.userDetails?.last_name === null
  ) {
    return redirect("/hello");
  }

  if (user.pcoConnection === null) {
    return redirect("/pco-reconnect");
  }

  if (user.organizationMembership) {
    if (!user.organization?.finished_onboarding) {
      return redirect("/get-started");
    }
  }

  if (!orgId) {
    await setOrgCookie(user.organizationMembership.organization_id);
  }

  if (user.pcoConnection) {
    const lastRefreshed = new Date(user.pcoConnection.last_refreshed);
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Only redirect if we're not already on the refresh page
    const headersList = await headers();
    const currentPath =
      headersList.get("x-pathname") || headersList.get("x-invoke-path");
    const isRefreshPage = currentPath?.startsWith("/pco-refresh");

    if (
      lastRefreshed < twoHoursAgo &&
      lastRefreshed > ninetyDaysAgo &&
      !isRefreshPage
    ) {
      // Token needs refresh but isn't expired
      const returnPath = currentPath || "/emails";
      return redirect(
        `/pco-refresh?return_to=${encodeURIComponent(returnPath)}`,
      );
    }

    if (lastRefreshed < ninetyDaysAgo) {
      // Token is too old, need to reconnect
      return redirect("/pco-reconnect");
    }
  }

  return (
    <ReactQueryProvider>
      <div className="relative">
        {children}
        <InitUser
          user={user.user}
          userData={user.userDetails}
          organization_id={user.organizationMembership.organization_id}
          role={user.organizationMembership.role}
          org_finished_onboarding={
            user.organization?.finished_onboarding ?? false
          }
          preferences={
            (user.userDetails.preferences as {
              welcomeStepsCompleted: boolean;
              productUpdateEmails: boolean;
            }) ?? {
              welcomeStepsCompleted: false,
              productUpdateEmails: true,
            }
          }
        />
        <InitPco
          pcoData={{
            id: user.pcoConnection?.id.toString() || null,
            access_token: user.pcoConnection?.access_token || null,
          }}
        />

        <HelpMenu />
      </div>
    </ReactQueryProvider>
  );
}
