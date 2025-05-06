import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";
import ClientPage from "./client-page";

export default async function Page() {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  if (!user.organizationMembership?.organization_id) {
    return redirect("/onboarding");
  }

  if (
    user.userDetails?.first_name !== null &&
    user.userDetails?.last_name !== null
  ) {
    return redirect("/emails");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/70 to-background/60 dark:from-secondary/30">
      <ClientPage userId={user.user.id} />
    </div>
  );
}
