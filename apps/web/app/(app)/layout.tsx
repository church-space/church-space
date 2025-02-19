import InitUser from "@/stores/init-user";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";
import { createClient } from "@trivo/supabase/server";
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

  if (
    user.userDetails[0].onboarded === false ||
    user.userDetails[0].organization_id === null
  ) {
    return redirect("/onboarding");
  }

  if (user.pcoConnection === null) {
    return redirect("/settings#pco-connection");
  }

  const headersList = await headers();
  const currentPath = headersList.get("x-pathname");

  console.log("Current path:", currentPath);

  if (user.pcoConnection) {
    const lastRefreshed = new Date(user.pcoConnection.last_refreshed);
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    if (lastRefreshed < twoHoursAgo && lastRefreshed > ninetyDaysAgo) {
      // Token needs refresh but isn't expired
      const headersList = await headers();
      const currentPath = headersList.get("x-pathname") || "/home";

      console.log("Redirecting to:", currentPath);

      return redirect(
        `/pco-refresh?return_to=${encodeURIComponent(currentPath)}`
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
      <InitUser user={user.user} userData={user.userDetails[0]} />
    </>
  );
}
