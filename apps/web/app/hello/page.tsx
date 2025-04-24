import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";
import ClientPage from "./client-page";

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

  if (user.organizationMembership?.organization_id) {
    return redirect("/onboarding");
  }

  if (user.userDetails?.first_name && user.userDetails?.last_name) {
    return redirect("/emails");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-card/100 to-background/60">
      <ClientPage />
    </div>
  );
}
