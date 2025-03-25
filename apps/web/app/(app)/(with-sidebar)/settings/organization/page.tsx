import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { cookies } from "next/headers";
import { createClient } from "@church-space/supabase/server";
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";
import {
  SettingsSection,
  SettingsHeader,
  SettingsTitle,
  SettingsDescription,
  SettingsContent,
  SettingsRow,
  SettingsRowTitle,
  SettingsRowDescription,
  SettingsRowAction,
} from "@/components/settings/settings-settings";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import ConnectToPcoButton from "@/components/pco/connect-to-pco-button";
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

  const domains = await getDomainsQuery(supabase, organizationId);
  const domainsList = domains.data || [];

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-0">
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
                <SettingsRowTitle>Planning Center</SettingsRowTitle>
                <SettingsRowDescription>
                  Connect your Planning Center account to sync data
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <ConnectToPcoButton />
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Members</SettingsTitle>
            <SettingsDescription>
              Manage organization members and their roles
            </SettingsDescription>
          </SettingsHeader>

          <SettingsContent>
            <div className="flex justify-end pb-4">
              <Button>Invite Member</Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-muted-foreground">
                      john@example.com
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">Admin</div>
                  <div className="text-sm text-muted-foreground">
                    Added Mar 23, 2024
                  </div>
                </div>
              </div>
            </div>
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
    </>
  );
}
