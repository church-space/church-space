import { SupportSidebar } from "@/components/sidebar/support-sidebar";
import { SidebarInset, SidebarProvider } from "@church-space/ui/sidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <SidebarProvider>
      <SupportSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
