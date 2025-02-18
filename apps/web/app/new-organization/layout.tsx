import InitUser from "@/stores/init-user";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";
import { createClient } from "@trivo/supabase/server";
import { redirect } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  if (user.userDetails[0].onboarded === false) {
    return redirect("/onboarding");
  }

  if (
    user.userDetails[0].onboarded === true &&
    user.userDetails[0].organization_id !== null
  ) {
    return redirect("/home");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-card/100 to-background/60">
      {children}
      <InitUser user={user.user} userData={user.userDetails[0]} />
    </div>
  );
}
