import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";
import { createClient } from "@trivo/supabase/server";
import { SidebarInset, SidebarProvider } from "@trivo/ui/sidebar";
import { redirect } from "next/navigation";
import InitUser from "@/stores/init-user";

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
    user.userDetails[0].organization_id === null
  ) {
    return redirect("/new-organization");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-card/100 to-background/60">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
        <InitUser user={user.user} userData={user.userDetails[0]} />
      </SidebarProvider>
    </div>
  );
}
