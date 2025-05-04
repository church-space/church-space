"use client";

import { Badge } from "@church-space/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Input } from "@church-space/ui/input";
import { Label } from "@church-space/ui/label";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Edit, Ellipsis, LoaderIcon, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import AutomationBuilder from "@/components/automation-builder/automation-builder";
import { Sheet, SheetContent, SheetTrigger } from "@church-space/ui/sheet";
import { getEmailAutomationAction } from "@/actions/get-email-automation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { redirect, useParams, useRouter } from "next/navigation";
import { useToast } from "@church-space/ui/use-toast";
import type { TriggerType } from "@/components/automation-builder/automation-builder";
import { updateEmailAutomationAction } from "@/actions/update-email-automation";
import { deleteEmailAutomationAction } from "@/actions/delete-email-automation";
import Cookies from "js-cookie";
import AutomationMembersTable from "@/components/tables/automation-members/table";
import { getActiveAutomationMembersCount } from "@/actions/get-active-automation-members-count";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@church-space/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@church-space/ui/tooltip";
import LoadingPage from "./loading-page";
import AutomationNotFound from "@/components/not-found/automation";

// Types for the new schema
interface AutomationStep {
  id: number;
  created_at: string;
  type: "wait" | "send_email";
  values: any;
  order: number | null;
  from_email_domain: number | null;
  email_template: number | null;
  updated_at: string | null;
}

interface EmailAutomation {
  id: number;
  created_at: string;
  name: string;
  trigger_type: TriggerType | null;
  list_id: number | null;
  description: string | null;
  organization_id: string;
  is_active: boolean;
  updated_at: string | null;
  email_category_id: number | null;
  steps: AutomationStep[];
}

export default function Page() {
  const params = useParams();
  const automationId = parseInt(params.automationId as string, 10);

  const organizationId = Cookies.get("organizationId");

  if (!organizationId) {
    redirect("/onboarding");
  }

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: automationResponse, isLoading: isLoadingAutomation } = useQuery(
    {
      queryKey: ["email-automation", automationId],
      queryFn: () =>
        getEmailAutomationAction({
          automationId: automationId,
          organizationId: organizationId,
        }),
    },
  );

  const automation = automationResponse?.data;

  const { data: activeAutomationMembersCountResponse } = useQuery({
    queryKey: ["active-automation-members-count", automationId],
    queryFn: () =>
      getActiveAutomationMembersCount({ automationId: automationId }),
  });

  const activeAutomationMembersCount =
    activeAutomationMembersCountResponse?.data?.count.length;

  // Transform the automation data to match EmailAutomation type
  const transformedAutomation: EmailAutomation | undefined =
    automation?.data && organizationId
      ? {
          id: automation.data.id,
          created_at: automation.data.created_at,
          name: automation.data.name || "",
          trigger_type: (automation.data.trigger_type as TriggerType) || null,
          list_id: automation.data.list_id || null,
          description: automation.data.description || null,
          organization_id: organizationId,
          is_active: automation.data.is_active || false,
          updated_at: automation.data.updated_at || null,
          email_category_id: automation.data.email_category_id || null,
          steps:
            automation.data.steps?.map((step) => ({
              id: step.id,
              created_at: step.created_at,
              type: step.type as "wait" | "send_email",
              values: step.values,
              order: step.order,
              from_email_domain: step.from_email_domain,
              email_template: step.email_template,
              updated_at: step.updated_at,
            })) || [],
        }
      : undefined;

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editedLinkName, setEditedLinkName] = useState("");
  const [linkErrors] = useState({
    name: null,
    url: null,
  });
  const [editedLinkStatus] = useState("active");
  const [editedLinkDescription, setEditedLinkDescription] = useState("");
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  const [isUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Add validation state
  const [canActivate, setCanActivate] = useState(false);

  // Track if we've already auto-opened the sheet
  const initialLoadDone = useRef(false);

  // Auto-open sheet when there are no steps, but only on initial load
  useEffect(() => {
    if (
      !initialLoadDone.current &&
      transformedAutomation &&
      transformedAutomation.steps.length === 0
    ) {
      setIsSheetOpen(true);
      initialLoadDone.current = true;
    }
  }, [transformedAutomation]);

  // Monitor automation state for activation requirements
  useEffect(() => {
    if (!transformedAutomation) return;

    const hasEmailStep = transformedAutomation.steps.some(
      (step) => step.type === "send_email",
    );
    const hasListId = transformedAutomation.list_id !== null;
    const hasEmailCategory = transformedAutomation.email_category_id !== null;
    const hasTriggerType = transformedAutomation.trigger_type !== null;

    const meetsRequirements =
      hasEmailStep && hasListId && hasEmailCategory && hasTriggerType;
    setCanActivate(meetsRequirements);

    // If currently active but requirements not met, deactivate
    if (transformedAutomation.is_active && !meetsRequirements) {
      // Update the automation to inactive
      updateEmailAutomationAction({
        automation_id: transformedAutomation.id,
        automation_data: {
          id: transformedAutomation.id,
          is_active: false,
        },
      }).then(() => {
        // Optimistically update the UI
        queryClient.setQueryData(
          ["email-automation", automationId],
          (old: any) => ({
            ...old,
            data: {
              ...old.data,
              data: {
                ...old.data.data,
                is_active: false,
              },
            },
          }),
        );

        toast({
          title: "Automation Deactivated",
          description:
            "The automation was deactivated because it no longer meets the minimum requirements.",
          variant: "default",
        });
      });
    }
  }, [transformedAutomation, automationId, queryClient]);

  // Update the state when automation data is loaded or editing is cancelled
  useEffect(() => {
    // Only reset the state if not currently editing
    if (transformedAutomation && !isEditingLink) {
      setEditedLinkName(transformedAutomation.name || "");
      setEditedLinkDescription(transformedAutomation.description || "");
    }
    // Add isEditingLink to dependencies to trigger reset on cancel
  }, [transformedAutomation, isEditingLink]);

  // Function to handle sheet close attempt
  const handleSheetClose = () => {
    if (hasUnsavedChanges) {
      // Show warning toast
      toast({
        title: "Unsaved Changes",
        description: "Please save or cancel your changes before closing.",
        variant: "destructive",
      });
      return false;
    }
    setIsSheetOpen(false);
    return true;
  };

  if (isLoadingAutomation) {
    return <LoadingPage />;
  }

  if (!transformedAutomation) {
    return <AutomationNotFound />;
  }

  const handleStatusToggle = () => {
    // Prevent activation if requirements aren't met
    if (!transformedAutomation.is_active && !canActivate) {
      toast({
        title: "Cannot Activate Automation",
        description:
          "Please ensure you have: a list selected, an email category set, at least one email step, and a trigger type configured.",
        variant: "destructive",
      });
      return;
    }

    // Check if deactivating and there are active members
    if (
      transformedAutomation.is_active &&
      activeAutomationMembersCount &&
      activeAutomationMembersCount > 0
    ) {
      setShowDeactivateConfirm(true); // Show confirmation dialog
      return; // Stop here until user confirms
    }

    // Proceed with activation or deactivation (if no active members)
    proceedWithStatusUpdate();
  };

  // Extracted logic for updating status
  const proceedWithStatusUpdate = async () => {
    const originalStatus = transformedAutomation.is_active;
    const newStatus = !originalStatus;

    // Optimistically update the UI
    queryClient.setQueryData(
      ["email-automation", automationId],
      (old: any) => ({
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            is_active: newStatus,
          },
        },
      }),
    );

    // Make the API call
    try {
      await updateEmailAutomationAction({
        automation_id: automationId,
        automation_data: {
          id: automationId,
          is_active: newStatus,
        },
      });
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: ["email-automation", automationId],
      });
      // Also refresh the automations list to reflect status change
      queryClient.invalidateQueries({
        queryKey: ["email-automations", organizationId],
      });
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(
        ["email-automation", automationId],
        (old: any) => ({
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              is_active: originalStatus, // Revert to original status
            },
          },
        }),
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update automation status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAutomation = async () => {
    setIsDeleting(true);
    try {
      // Check if there are active members
      if (activeAutomationMembersCount === 0) {
        // No active members, call the direct server action
        const result = await deleteEmailAutomationAction({ automationId });

        // Check if the action returned a server error
        if (result?.serverError) {
          throw new Error(
            result.serverError || "Failed to delete automation directly.",
          );
        }

        // If no serverError, assume success
        toast({
          title: "Automation Deleted",
          description: "The automation has been successfully deleted.",
          variant: "default",
        });
        router.push("/emails/automations"); // Redirect after success
      } else {
        // Active members exist, call the API route to trigger background deletion
        const response = await fetch("/api/automations/delete-automation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ automationId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to initiate background delete.",
          );
        }

        toast({
          title: "Deletion Started",
          description:
            "The automation is being deleted in the background as it has active members. This may take a few moments.",
          variant: "default",
        });
        router.push("/emails/automations"); // Redirect after successfully triggering the job
      }
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete automation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // Reset loading state regardless of outcome
      setIsDeletingLink(false); // Close the dialog
    }
  };

  const cancelEditingLink = () => {
    setIsEditingLink(false);
    setEditedLinkName(transformedAutomation.name || "");
    setEditedLinkDescription(transformedAutomation.description || "");
    // TODO: Implement cancel editing link
  };

  const saveEditedLink = () => {
    setIsEditingLink(false);

    // Optimistically update the UI
    queryClient.setQueryData(
      ["email-automation", automationId],
      (old: any) => ({
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            name: editedLinkName,
            description: editedLinkDescription,
          },
        },
      }),
    );

    // Make the API call
    updateEmailAutomationAction({
      automation_id: automationId,
      automation_data: {
        id: automationId,
        name: editedLinkName,
        description: editedLinkDescription,
      },
    })
      .then(() => {
        // Refetch to ensure we have the latest data
        queryClient.invalidateQueries({
          queryKey: ["email-automation", automationId],
        });
        // Also invalidate the automations list to reflect the renamed automation
        queryClient.invalidateQueries({
          queryKey: ["email-automations", organizationId],
        });
      })
      .catch(() => {
        // Revert on error
        queryClient.setQueryData(
          ["email-automation", automationId],
          (old: any) => ({
            ...old,
            data: {
              ...old.data,
              data: {
                ...old.data.data,
                name: transformedAutomation.name,
                description: transformedAutomation.description,
              },
            },
          }),
        );
        toast({
          title: "Error",
          description: "Failed to update automation details. Please try again.",
          variant: "destructive",
        });
      });
  };

  const startEditingLink = () => {
    setIsEditingLink(true);
    // TODO: Implement start editing link
  };

  return (
    <div className="relative">
      <AlertDialog
        open={showDeactivateConfirm}
        onOpenChange={setShowDeactivateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Warning: Active Members Will Be Affected
            </AlertDialogTitle>
            <AlertDialogDescription>
              There {activeAutomationMembersCount === 1 ? "is" : "are"}{" "}
              {activeAutomationMembersCount} active{" "}
              {activeAutomationMembersCount === 1 ? "member" : "members"} in
              this automation. Disabling the automation will cancel their
              current progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeactivateConfirm(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                // Call cancel-run API
                try {
                  const response = await fetch("/api/automations/cancel-run", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      automationId: automationId,
                      reason: "automation deactivated",
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    console.error(
                      "Failed to cancel automation runs:",
                      errorData.error,
                    );
                    toast({
                      title: "Error",
                      description: `Failed to stop active members: ${errorData.error || "Unknown error"}`, // More specific error
                      variant: "destructive",
                    });
                    setShowDeactivateConfirm(false); // Close dialog even on error
                    return; // Stop if canceling runs fails
                  }
                } catch (error) {
                  console.error("Error calling cancel-run API:", error);
                  toast({
                    title: "Error",
                    description:
                      error instanceof Error
                        ? error.message
                        : "An unexpected error occurred while stopping active members.",
                    variant: "destructive",
                  });
                  setShowDeactivateConfirm(false); // Close dialog even on error
                  return; // Stop if API call fails
                }

                // Proceed with deactivation after successful cancel
                proceedWithStatusUpdate();
                setShowDeactivateConfirm(false); // Close dialog
              }}
            >
              Disable Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Link prefetch={true} href="/emails">
                  Emails
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <Link prefetch={true} href="/emails/automations">
                  Automations
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{transformedAutomation.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setIsEditingLink(true);
                }}
              >
                <Edit className="h-4 w-4" /> Edit
              </DropdownMenuItem>

              <Dialog open={isDeletingLink} onOpenChange={setIsDeletingLink}>
                <DialogTrigger
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDeletingLink(true);
                  }}
                  asChild
                >
                  <DropdownMenuItem className="!hover:text-destructive cursor-pointer">
                    <Trash /> Delete
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Automation</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this automation? This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeletingLink(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAutomation}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={handleStatusToggle}
                  disabled={
                    isUpdatingStatus ||
                    (!transformedAutomation.is_active && !canActivate)
                  }
                  className="cursor-pointer"
                  variant={
                    transformedAutomation.is_active ? "outline" : "default"
                  }
                >
                  {transformedAutomation.is_active ? "Disable" : "Enable"}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {!transformedAutomation.is_active && !canActivate ? (
                <>
                  To enable this automation, please ensure you have: a list
                  selected, an email category set, at least one email step, and
                  a trigger type configured
                </>
              ) : (
                <>Toggle if this automation is active or inactive</>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="flex flex-col space-y-6">
          {/* Link Information Section */}
          <div className="flex w-full justify-between gap-4 border-b pb-4">
            {isEditingLink ? (
              // Edit mode
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="edit-link-name" className="mb-2 block">
                    Automation Name
                  </Label>

                  <Input
                    id="edit-link-name"
                    value={editedLinkName}
                    onChange={(e) => setEditedLinkName(e.target.value)}
                    placeholder="Enter a name for this automation"
                    autoFocus
                    maxLength={150}
                    className={linkErrors.name ? "border-destructive" : ""}
                  />
                  {linkErrors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {linkErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-link-url" className="mb-2 block">
                    Automation Description
                  </Label>
                  <Input
                    id="edit-link-url"
                    value={editedLinkDescription}
                    onChange={(e) => setEditedLinkDescription(e.target.value)}
                    placeholder="Enter the automation description"
                    className={linkErrors.url ? "border-destructive" : ""}
                    maxLength={500}
                  />
                  {linkErrors.url && (
                    <p className="mt-1 text-sm text-destructive">
                      {linkErrors.url}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={cancelEditingLink}>
                    Cancel
                  </Button>
                  <Button onClick={saveEditedLink}>Save</Button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex w-full items-center justify-between gap-4">
                <div
                  className="group flex-1 cursor-pointer"
                  onClick={startEditingLink}
                >
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-row items-center gap-2">
                        <h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
                          {transformedAutomation.name}
                        </h2>
                        <Badge
                          variant={
                            transformedAutomation.is_active
                              ? "default"
                              : "outline"
                          }
                        >
                          {transformedAutomation.is_active
                            ? "Active"
                            : "Disabled"}
                        </Badge>
                      </div>
                      {editedLinkStatus === "inactive" && (
                        <Badge variant="outline">Disabled</Badge>
                      )}
                    </div>
                    <Edit className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {transformedAutomation.description}
                  </p>
                </div>

                <Sheet
                  open={isSheetOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      // If trying to close
                      if (handleSheetClose()) {
                        setIsSheetOpen(false);
                      }
                    } else {
                      setIsSheetOpen(true);
                    }
                  }}
                >
                  <>
                    <SheetTrigger asChild>
                      <Button onClick={() => setIsSheetOpen(true)}>
                        Edit Steps
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="flex h-[95%] w-full flex-col overflow-hidden md:h-full md:max-w-3xl"
                      side={isMobile ? "bottom" : "right"}
                    >
                      <AutomationBuilder
                        organizationId={organizationId ?? ""}
                        onChangesPending={(hasPendingChanges) =>
                          setHasUnsavedChanges(hasPendingChanges)
                        }
                        automation={transformedAutomation}
                        closeSheet={() => setIsSheetOpen(false)}
                        activeAutomationMembersCount={
                          activeAutomationMembersCount
                        }
                      />
                    </SheetContent>
                  </>
                </Sheet>
              </div>
            )}
          </div>

          <AutomationMembersTable automationId={automationId} />
        </div>
      </div>
    </div>
  );
}
