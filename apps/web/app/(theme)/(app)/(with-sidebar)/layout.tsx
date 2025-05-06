import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@church-space/ui/sidebar";
import { SidebarStateProvider } from "@/components/sidebar/sidebar-state-provider";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <SidebarStateProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarStateProvider>
  );
}
