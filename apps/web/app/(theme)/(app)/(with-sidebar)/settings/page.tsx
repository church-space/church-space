import DeleteAccount from "@/components/settings/delete-account";
import EmailChange from "@/components/settings/email-change";
import EmailNotifications from "@/components/settings/email-notifications";
import {
  SettingsContent,
  SettingsHeader,
  SettingsRow,
  SettingsRowAction,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
  SettingsTitle,
} from "@/components/settings/settings-settings";
import SettingsUserName from "@/components/settings/settings-user-name";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { createClient } from "@church-space/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@church-space/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return <div>Not logged in</div>;
  }
  if (!organizationId) {
    return <div>No organization selected</div>;
  }

  const userDetails = user.userDetails as {
    avatar_url: string | null;
    created_at: string;
    email: string;
    first_name: string | null;
    id: string;
    last_name: string | null;
    preferences: any;
  };

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
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
            <SettingsTitle>Profile</SettingsTitle>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={userDetails?.avatar_url || ""}
                    alt={userDetails?.email || ""}
                  />
                  <AvatarFallback>
                    {userDetails?.first_name?.[0] || ""}
                    {userDetails?.last_name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SettingsRowTitle>Profile Picture</SettingsRowTitle>
                  <SettingsRowDescription>
                    Your profile picture is synced from your Planning Center
                    account. We&apos;ll let you update it here soon.
                  </SettingsRowDescription>
                </div>
              </div>
            </SettingsRow>
            <SettingsUserName
              initialFirstName={userDetails?.first_name || ""}
              initialLastName={userDetails?.last_name || ""}
              userId={userDetails?.id || ""}
            />
            <SettingsRow>
              <SettingsRowTitle>Email</SettingsRowTitle>
              <SettingsRowAction className="w-full">
                <EmailChange email={userDetails?.email || ""} />
              </SettingsRowAction>
            </SettingsRow>
            <EmailNotifications
              recieveProductUpdates={
                userDetails?.preferences?.productUpdateEmails ?? false
              }
              userId={userDetails?.id || ""}
            />
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Preferences</SettingsTitle>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div className="flex items-center gap-2">
                <SettingsRowTitle>Theme</SettingsRowTitle>
                <SettingsRowDescription>
                  Choose your preferred theme
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <ThemeSelector />
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>

        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Danger Zone</SettingsTitle>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle>Delete Account</SettingsRowTitle>
                <SettingsRowDescription>
                  Permanently delete your account and all associated data
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <DeleteAccount
                  userId={userDetails?.id || ""}
                  userEmail={userDetails?.email || ""}
                  orgRole={user.organizationMembership?.role || ""}
                  organizationId={organizationId}
                />
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>
      </div>
    </div>
  );
}
