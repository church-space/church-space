import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";
import ClientPage from "./client-page";

export default async function ProtectedLayout({}) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  if (!user.organizationMembership) {
    return redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/70 to-background/60 dark:from-secondary/30">
      <ClientPage
        organizationId={user.organizationMembership.organization_id}
      />
    </div>
  );
}
