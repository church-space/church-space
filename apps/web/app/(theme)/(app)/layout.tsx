import InitUser from "@/stores/init-user";
import InitPco from "@/stores/init-pco";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";
import HelpMenu from "@/components/sidebar/help-menu";
import { ReactQueryProvider } from "@/components/providers/react-query";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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
    user.userDetails?.first_name === "" ||
    user.userDetails?.last_name === null ||
    user.userDetails?.last_name === ""
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
    // Redirect to API route to set cookie, then return to current page
    return redirect(
      `/api/set-org-cookie?organizationId=${encodeURIComponent(user.organizationMembership.organization_id)}&returnTo=/emails`,
    );
  }

  if (user.pcoConnection) {
    const lastRefreshed = new Date(user.pcoConnection.last_refreshed);
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

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
            refresh_token: user.pcoConnection?.refresh_token || null,
            last_refreshed: user.pcoConnection?.last_refreshed || null,
          }}
        />

        <HelpMenu />
      </div>
    </ReactQueryProvider>
  );
}
