import { SettingsSidebar } from "@/components/sidebar/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@church-space/ui/sidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
