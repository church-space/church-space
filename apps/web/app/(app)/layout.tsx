import InitUser from "@/stores/init-user";
import InitPco from "@/stores/init-pco";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  if (!user.organizationMembership) {
    return redirect("/onboarding");
  }

  if (user.pcoConnection === null) {
    return redirect("/pco-reconnect");
  }
  const headersList = await headers();
  console.log("headersList", headersList.get("x-pathname"));

  if (user.pcoConnection) {
    const lastRefreshed = new Date(user.pcoConnection.last_refreshed);
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    if (lastRefreshed < twoHoursAgo && lastRefreshed > ninetyDaysAgo) {
      // Token needs refresh but isn't expired
      const headersList = await headers();
      const currentPath = headersList.get("x-pathname");
      const returnPath =
        currentPath || headersList.get("x-invoke-path") || "/home";

      return redirect(
        `/pco-refresh?return_to=${encodeURIComponent(returnPath)}`
      );
    }

    if (lastRefreshed < ninetyDaysAgo) {
      // Token is too old, need to reconnect
      return redirect("/pco-reconnect");
    }
  }

  return (
    <>
      {children}
      <InitUser
        user={user.user}
        userData={user.userDetails[0]}
        organization_id={user.organizationMembership.organization_id}
      />
      <InitPco
        pcoData={{
          id: user.pcoConnection?.id.toString() || null,
          access_token: user.pcoConnection?.access_token || null,
        }}
      />
    </>
  );
}
