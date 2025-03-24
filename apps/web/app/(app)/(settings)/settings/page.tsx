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
import { ThemeSelector } from "@/components/settings/theme-selector";
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
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import ProfileUploadModal from "@/components/image-cropper/image-cropper";

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

  const userDetails = (
    user.userDetails as {
      avatar_url: string | null;
      created_at: string;
      email: string;
      first_name: string | null;
      id: string;
      last_name: string | null;
    }[]
  )?.[0];

  console.log(userDetails);

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
                    Upload a new profile picture
                  </SettingsRowDescription>
                </div>
              </div>
              <SettingsRowAction>
                <ProfileUploadModal />
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <SettingsRowTitle>First Name</SettingsRowTitle>
              <SettingsRowAction>
                <Input
                  defaultValue={userDetails?.first_name || ""}
                  placeholder="Enter your first name"
                  className="w-full"
                />
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <SettingsRowTitle>Last Name</SettingsRowTitle>
              <SettingsRowAction>
                <Input
                  defaultValue={userDetails?.last_name || ""}
                  placeholder="Enter your last name"
                  className="w-full"
                />
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <SettingsRowTitle>Email</SettingsRowTitle>
              <SettingsRowAction>
                <Input
                  defaultValue={userDetails?.email || ""}
                  placeholder="Enter your email"
                  type="email"
                />
              </SettingsRowAction>
            </SettingsRow>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Account
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
