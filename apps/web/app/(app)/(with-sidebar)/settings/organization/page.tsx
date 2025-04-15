import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
import DisconnectFromPcoButton from "@/components/pco/disconnect-from-pco-button";
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
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { format } from "date-fns";
import { cookies } from "next/headers";
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

  const data = await Promise.all([
    getDomainsQuery(supabase, organizationId),
    getPcoConnection(supabase, organizationId),
  ]);
  const domainsList = data[0].data || [];
  const pcoConnection = data[1].data || null;

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-sm">
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
      <div className="flex flex-1 flex-col gap-16 p-4 pb-24 pt-0">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Organization</SettingsTitle>
            <SettingsDescription>
              Manage your organization settings
            </SettingsDescription>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/org-avatar.png" alt="Organization" />
                  <AvatarFallback>ORG</AvatarFallback>
                </Avatar>
                <div>
                  <SettingsRowTitle>Organization Name</SettingsRowTitle>
                  <SettingsRowDescription>
                    Change your organization name
                  </SettingsRowDescription>
                </div>
              </div>
              <SettingsRowAction>
                <Input
                  defaultValue="Church Space"
                  placeholder="Enter organization name"
                  className="w-full"
                  maxLength={255}
                />
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Primary Email</SettingsRowTitle>
                <SettingsRowDescription>
                  Set the primary email for your organization
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <div className="flex gap-2">
                  <Input
                    defaultValue="contact"
                    placeholder="Enter email prefix"
                    className="w-full"
                    maxLength={255}
                  />
                  <span className="flex items-center">@</span>
                  <Select defaultValue={domainsList[0]?.domain || ""}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domainsList.map((domain) => (
                        <SelectItem key={domain.id} value={domain.domain}>
                          {domain.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Integrations</SettingsTitle>
            <SettingsDescription>
              Connect your organization with external services
            </SettingsDescription>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                  Planning Center
                </SettingsRowTitle>
                <div className="text-sm text-muted-foreground">
                  {pcoConnection ? (
                    <div className="flex flex-col">
                      <p>
                        Connected by{" "}
                        <span className="font-medium">
                          {pcoConnection.users.first_name}{" "}
                          {pcoConnection.users.last_name}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connected on{" "}
                        {format(
                          new Date(pcoConnection.created_at),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                  ) : (
                    "Connect your PCO account to sync data"
                  )}
                </div>
              </div>
              <SettingsRowAction>
                {!pcoConnection ? (
                  <ConnectToPcoButton />
                ) : (
                  <DisconnectFromPcoButton />
                )}
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-col">
              <SettingsTitle>Members</SettingsTitle>
              <SettingsDescription>
                Manage the people in your organization.
              </SettingsDescription>
            </div>
            <Button>Invite Member</Button>
          </SettingsHeader>

          <SettingsContent>
            <OrgMembers organizationId={organizationId} />
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Danger Zone</SettingsTitle>
            <SettingsDescription>
              Irreversible and destructive actions
            </SettingsDescription>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle>Delete Organization</SettingsRowTitle>
                <SettingsRowDescription>
                  Permanently delete your organization and all associated data
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Organization</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your organization and remove all associated data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>
      </div>
    </div>
  );
}
