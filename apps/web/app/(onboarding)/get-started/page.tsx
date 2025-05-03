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

  if (user.organization?.finished_onboarding === true) {
    return redirect("/emails");
  }

  if (!user.organization) {
    return redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-auto bg-gradient-to-b from-secondary/70 to-background/60 dark:from-secondary/30">
      <ClientPage userId={user.user.id} organizationId={user.organization.id} />
    </div>
  );
}
