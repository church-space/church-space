import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
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

  if (user.organizationMembership) {
    return redirect("/get-started");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/70 to-background/60 dark:from-secondary/30">
      {children}
    </div>
  );
}
