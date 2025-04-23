import DomainSelector from "@/components/id-pages/emails/domain-selector";
import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import DisconnectFromPcoButton from "@/components/pco/disconnect-from-pco-button";
import { InviteModal } from "@/components/settings/invite-modal";
import OrgMembers from "@/components/settings/org-members";
import {
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsRow,
  SettingsRowAction,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
  SettingsTitle,
} from "@/components/settings/settings-settings";
import { getPcoConnection } from "@church-space/supabase/queries/all/get-pco-connection";
import { createClient } from "@church-space/supabase/server";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@church-space/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { format } from "date-fns";
import { cookies } from "next/headers";
import ClientPage from "./client-page";

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    return <div>Not logged in</div>;
  }
  if (!organizationId) {
    return <div>No organization selected</div>;
  }

  const data = await Promise.all([getPcoConnection(supabase, organizationId)]);
  const pcoConnection = data[0].data || null;

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Organization</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <ClientPage
        organizationId={organizationId}
        pcoConnection={pcoConnection}
      />
    </div>
  );
}
