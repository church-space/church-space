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
import { useState, useEffect } from "react";
import { updateOrganizationDataAction } from "@/actions/update-organization-data";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@church-space/ui/use-toast";
import OrgInvites from "@/components/settings/invites";
import { Label } from "@church-space/ui/label";
import { useTransition } from "react";
import { deleteOrganizationAction } from "@/actions/delete-organizaion";
import { useRouter } from "next/navigation";

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export default function ClientPage({
  organizationId,
  pcoConnection,
  orgName,
  defaultEmail,
  defaultEmailDomain,
  address,
}: {
  organizationId: string;
  pcoConnection: any;
  orgName?: string;
  defaultEmail?: string;
  defaultEmailDomain?: number;
  address?: Address;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasBeenModified, setHasBeenModified] = useState(false);
  const [localOrgName, setLocalOrgName] = useState(orgName || "");
  const [localDefaultEmail, setLocalDefaultEmail] = useState(
    defaultEmail || "",
  );
  const [localDefaultEmailDomain, setLocalDefaultEmailDomain] = useState(
    defaultEmailDomain?.toString() || "",
  );
  const [localAddress, setLocalAddress] = useState<Address>(address || {});

  const debouncedOrgName = useDebounce(localOrgName, 500);
  const debouncedDefaultEmail = useDebounce(localDefaultEmail, 500);
  const debouncedDefaultEmailDomain = useDebounce(localDefaultEmailDomain, 500);
  const debouncedAddress = useDebounce(localAddress, 500);
  const [inputOrgName, setInputOrgName] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !hasBeenModified) return;

    // Don't update if the values are the same as initial values
    if (
      debouncedOrgName === orgName &&
      debouncedDefaultEmail === defaultEmail &&
      debouncedDefaultEmailDomain === defaultEmailDomain?.toString() &&
      JSON.stringify(debouncedAddress) === JSON.stringify(address)
    ) {
      return;
    }

    const updateOrganization = async () => {
      try {
        setError(null);
        const result = await updateOrganizationDataAction({
          organizationId,
          name: debouncedOrgName,
          defaultEmail: debouncedDefaultEmail,
          defaultEmailDomain: debouncedDefaultEmailDomain
            ? parseInt(debouncedDefaultEmailDomain, 10)
            : null,
          address: {
            line1: debouncedAddress.line1 || "",
            line2: debouncedAddress.line2 || "",
            city: debouncedAddress.city || "",
            state: debouncedAddress.state || "",
            zip: debouncedAddress.zip || "",
            country: debouncedAddress.country || "",
          },
        });

        if (!result) {
          setError("Failed to update organization: no response received");
          setLocalOrgName(orgName || "");
          setLocalDefaultEmail(defaultEmail || "");
          setLocalDefaultEmailDomain(defaultEmailDomain?.toString() || "");
          setLocalAddress(address || {});
          return;
        }

        if (result.data?.error) {
          setError(result.data?.error || "Failed to update organization");
          setLocalOrgName(orgName || "");
          setLocalDefaultEmail(defaultEmail || "");
          setLocalDefaultEmailDomain(defaultEmailDomain?.toString() || "");
          setLocalAddress(address || {});
          return;
        }

        // If we get here, the update was successful
        // No need to do anything as the local state already matches what we sent
        toast({
          title: "Organization updated",
          description: "Your changes have been saved successfully.",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update organization",
        );
        setLocalOrgName(orgName || "");
        setLocalDefaultEmail(defaultEmail || "");
        setLocalDefaultEmailDomain(defaultEmailDomain?.toString() || "");
        setLocalAddress(address || {});
      }
    };

    updateOrganization();
  }, [
    isMounted,
    debouncedOrgName,
    debouncedDefaultEmail,
    debouncedDefaultEmailDomain,
    debouncedAddress,
    organizationId,
    orgName,
    defaultEmail,
    defaultEmailDomain,
    address,
  ]);

  const updateAddress = (field: keyof Address, value: string) => {
    setHasBeenModified(true);
    setLocalAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteOrganization = async () => {
    if (inputOrgName !== orgName) {
      toast({
        title: "Error",
        description: "Organization name does not match.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteOrganizationAction({
          organizationId,
          organizationName: inputOrgName,
        });

        // Check if the action returned a successful result
        if (result && "data" in result && result.data) {
          // Assuming success is indicated by presence of data
          toast({
            title: "Organization Deleted",
            description: "Your organization has been successfully deleted.",
          });
          // Redirect to a safe page, e.g., dashboard or home
          router.push("/homepage"); // Or another appropriate route
        } else if (result && "error" in result && result.error) {
          // Handle error case returned by the action
          const errorMsg =
            typeof result.error === "string"
              ? result.error
              : "An unexpected error occurred during deletion.";
          setError(errorMsg);
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
        } else {
          // Handle unexpected result structure or network failure before action
          const errorMsg =
            "Failed to delete organization due to an unexpected issue.";
          setError(errorMsg);
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-16 p-4 pb-24 pt-0">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <SettingsSection>
        <SettingsHeader>
          <SettingsTitle>Organization</SettingsTitle>
          <SettingsDescription>
            Manage your organization settings
          </SettingsDescription>
        </SettingsHeader>

        <SettingsContent>
          <SettingsRow isFirstRow larger>
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
            <SettingsRowAction larger>
              <Input
                placeholder="Enter organization name"
                className="w-full bg-background"
                maxLength={255}
                value={localOrgName}
                onChange={(e) => {
                  setHasBeenModified(true);
                  setLocalOrgName(e.target.value);
                }}
              />
            </SettingsRowAction>
          </SettingsRow>
          <SettingsRow larger>
            <div>
              <SettingsRowTitle>Primary Email</SettingsRowTitle>
              <SettingsRowDescription>
                Primary email for your organization
              </SettingsRowDescription>
            </div>
            <SettingsRowAction larger>
              <div className="flex w-full flex-row gap-2 md:flex-col lg:flex-row">
                <div className="flex w-full flex-row gap-2">
                  <Input
                    placeholder="Enter email prefix"
                    className="w-full bg-background"
                    maxLength={255}
                    value={localDefaultEmail}
                    onChange={(e) => {
                      setHasBeenModified(true);
                      setLocalDefaultEmail(e.target.value);
                    }}
                  />
                  <span className="flex items-center">@</span>
                </div>
                <DomainSelector
                  className="w-full"
                  organizationId={organizationId}
                  onChange={(value) => {
                    setHasBeenModified(true);
                    setLocalDefaultEmailDomain(value);
                  }}
                  selectFirstOnLoad={false}
                  value={localDefaultEmailDomain}
                />
              </div>
            </SettingsRowAction>
          </SettingsRow>
          <SettingsRow larger>
            <div>
              <SettingsRowTitle>Primary Address</SettingsRowTitle>
              <SettingsRowDescription>
                Primary organization address
              </SettingsRowDescription>
            </div>
            <SettingsRowAction larger>
              <div className="grid grid-cols-3">
                <Input
                  placeholder="Address Line One"
                  className="col-span-3 h-8 w-full rounded-b-none border-b-0 bg-background"
                  maxLength={255}
                  value={localAddress.line1 || ""}
                  onChange={(e) => updateAddress("line1", e.target.value)}
                />
                <Input
                  placeholder="Address Line Two"
                  className="col-span-3 h-8 w-full rounded-none border-b-0 bg-background"
                  maxLength={255}
                  value={localAddress.line2 || ""}
                  onChange={(e) => updateAddress("line2", e.target.value)}
                />
                <Input
                  placeholder="City"
                  className="h-8 w-full rounded-none border-b-0 border-r-0 bg-background"
                  maxLength={255}
                  value={localAddress.city || ""}
                  onChange={(e) => updateAddress("city", e.target.value)}
                />
                <Input
                  placeholder="State"
                  className="h-8 w-full rounded-none border-b-0 border-r-0 bg-background"
                  maxLength={255}
                  value={localAddress.state || ""}
                  onChange={(e) => updateAddress("state", e.target.value)}
                />
                <Input
                  placeholder="Zip Code"
                  className="h-8 w-full rounded-none border-b-0 bg-background"
                  maxLength={255}
                  value={localAddress.zip || ""}
                  onChange={(e) => updateAddress("zip", e.target.value)}
                />
                <CountrySelect
                  className="col-span-3 h-8 rounded-t-none bg-background"
                  value={localAddress.country}
                  onValueChange={(value) => {
                    setHasBeenModified(true);
                    updateAddress("country", value);
                  }}
                />
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

        <OrgInvites organizationId={organizationId} />
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
                  <Button variant="destructive" className="w-full md:w-auto">
                    Delete Organization
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your organization and remove all associated data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="flex flex-col gap-1">
                      <div className="font-normal">
                        Please enter your organization name to confirm:
                      </div>
                      <div className="font-bold">{orgName}</div>
                    </Label>
                    <Input
                      id="orgName"
                      type="text"
                      aria-placeholder="Enter your organization name"
                      value={inputOrgName}
                      onChange={(e) => setInputOrgName(e.target.value)}
                      placeholder={orgName}
                      maxLength={200}
                      autoFocus
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={inputOrgName !== orgName || isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteOrganization}
                    >
                      {isPending ? "Deleting..." : "Delete Organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SettingsRowAction>
          </SettingsRow>
        </SettingsContent>
      </SettingsSection>
    </div>
  );
}
