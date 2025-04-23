"use client";

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
import { Button } from "@church-space/ui/button";
import { Input } from "@church-space/ui/input";
import CountrySelect from "@church-space/ui/country-select";
import { format } from "date-fns";

export default function ClientPage({
  organizationId,
  pcoConnection,
}: {
  organizationId: string;
  pcoConnection: any;
}) {
  return (
    <>
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
                  className="w-full bg-background"
                  maxLength={255}
                />
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Primary Email</SettingsRowTitle>
                <SettingsRowDescription>
                  Primary email for your organization
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <div className="flex gap-2">
                  <Input
                    defaultValue="contact"
                    placeholder="Enter email prefix"
                    className="w-full bg-background"
                    maxLength={255}
                  />
                  <span className="flex items-center">@</span>
                  <DomainSelector
                    organizationId={organizationId}
                    onChange={() => {}}
                    value={""}
                  />
                </div>
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Primary Address</SettingsRowTitle>
                <SettingsRowDescription>
                  Primary organization address
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <div className="grid grid-cols-3">
                  <Input
                    placeholder="Address Line One"
                    className="col-span-3 w-full rounded-b-none border-b-0 bg-background"
                    maxLength={255}
                  />
                  <Input
                    placeholder="Address Line Two"
                    className="col-span-3 w-full rounded-none border-b-0 bg-background"
                    maxLength={255}
                  />
                  <Input
                    placeholder="City"
                    className="w-full rounded-none border-b-0 border-r-0 bg-background"
                    maxLength={255}
                  />
                  <Input
                    placeholder="State"
                    className="w-full rounded-none border-b-0 border-r-0 bg-background"
                    maxLength={255}
                  />
                  <Input
                    placeholder="Zip Code"
                    className="w-full rounded-none border-b-0 bg-background"
                    maxLength={255}
                  />
                  <CountrySelect className="col-span-3 rounded-t-none bg-background" />
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
                  <ConnectToPcoButton isReconnect={true} />
                ) : (
                  <DisconnectFromPcoButton organizationId={organizationId} />
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
            <InviteModal organizationId={organizationId} />
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
    </>
  );
}
