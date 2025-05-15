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
import { Ellipsis, LoaderIcon, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import AutomationBuilder from "@/components/automation-builder/automation-builder";
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
import { Edit, Trash, Footsteps, Settings } from "@church-space/ui/icons";
import { Tabs, TabsContent, TabsTrigger } from "@church-space/ui/tabs";
import { motion } from "framer-motion";
import { TabsList } from "@church-space/ui/tabs";
import { useQueryState } from "nuqs";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};

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
    redirect("/emails/automations");
  }

  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (hasUnsavedChanges) {
      toast({
        title: "Unsaved Changes",
        description:
          "You have unsaved changes. Please save them before leaving.",
      });
    }
  }, [hasUnsavedChanges]);

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
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "steps",
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  // Add validation state
  const [canActivate, setCanActivate] = useState(false);

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
  }, [transformedAutomation, automationId, queryClient, toast]);

  // Update the state when automation data is loaded or editing is cancelled
  useEffect(() => {
    // Only reset the state if not currently editing
    if (transformedAutomation && !isEditingLink) {
      setEditedLinkName(transformedAutomation.name || "");
      setEditedLinkDescription(transformedAutomation.description || "");
    }
    // Add isEditingLink to dependencies to trigger reset on cancel
  }, [transformedAutomation, isEditingLink]);

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
                <Edit height={"24"} width={"24"} /> Edit Name
              </DropdownMenuItem>

              <Dialog open={isDeletingLink} onOpenChange={setIsDeletingLink}>
                <DialogTrigger
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDeletingLink(true);
                  }}
                  asChild
                >
                  <DropdownMenuItem className="cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                    <Trash height={"24"} width={"24"} /> Delete
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

      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mb-4 flex flex-row items-center justify-between pt-12"
          variants={itemVariants}
        >
          <div className="flex w-full justify-between gap-4 pb-4 pl-3">
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
              <div
                className="flex w-full flex-col items-start gap-2 hover:cursor-pointer"
                onClick={() => {
                  setIsEditingLink(true);
                }}
              >
                <div className="group flex w-full items-center gap-2">
                  <h1 className="text-3xl font-bold">
                    {transformedAutomation.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                    <Badge
                      variant={
                        transformedAutomation.is_active ? "default" : "outline"
                      }
                    >
                      {transformedAutomation.is_active ? "Active" : "Disabled"}
                    </Badge>

                    {editedLinkStatus === "inactive" && (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                  <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Edit height={"18"} width={"18"} />
                  </div>
                </div>
                {transformedAutomation.description && (
                  <p className="mt-1 text-muted-foreground">
                    {transformedAutomation.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
        <Tabs
          defaultValue="steps"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-2 h-fit w-full justify-start rounded-none border-b bg-transparent p-0 shadow-none">
            <TabsTrigger
              value="steps"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <Footsteps height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <Footsteps height={"16"} width={"16"} />
              </span>
              Steps
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <Users height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <Users height={"16"} width={"16"} />
              </span>
              People
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <Settings height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <Settings height={"16"} width={"16"} />
              </span>
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="steps" className="flex flex-col gap-4">
            <motion.div className="w-full" variants={itemVariants}>
              <AutomationBuilder
                organizationId={organizationId ?? ""}
                onChangesPending={(hasPendingChanges) =>
                  setHasUnsavedChanges(hasPendingChanges)
                }
                automation={transformedAutomation}
                activeAutomationMembersCount={activeAutomationMembersCount}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="people">
            <motion.div
              className="mt-4 flex flex-col gap-4"
              variants={itemVariants}
            >
              <AutomationMembersTable automationId={automationId} />
            </motion.div>
          </TabsContent>
          <TabsContent value="settings" className="h-full w-full">
            <motion.div
              className="mt-4 flex flex-col gap-4"
              variants={itemVariants}
            ></motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
