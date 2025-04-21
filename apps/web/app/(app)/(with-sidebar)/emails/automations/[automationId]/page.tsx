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
import { Edit, Ellipsis, LinkIcon, LoaderIcon, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import AutomationBuilder from "@/components/automation-builder/automation-builder";
import { DisableLink } from "@church-space/ui/icons";
import { Sheet, SheetContent, SheetTrigger } from "@church-space/ui/sheet";
import { useUser } from "@/stores/use-user";
import { getEmailAutomationAction } from "@/actions/get-email-automation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useToast } from "@church-space/ui/use-toast";
import type { TriggerType } from "@/components/automation-builder/automation-builder";
import { updateEmailAutomationAction } from "@/actions/update-email-automation";

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
  const { organizationId } = useUser();
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
        }),
    },
  );

  const automation = automationResponse?.data;

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
  const [isDeleting] = useState(false);

  const queryClient = useQueryClient();

  // Update the state when automation data is loaded
  useEffect(() => {
    if (transformedAutomation) {
      setEditedLinkName(transformedAutomation.name || "");
      setEditedLinkDescription(transformedAutomation.description || "");
    }
  }, [transformedAutomation]);

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
    return <div>Loading...</div>;
  }

  if (!transformedAutomation) {
    return <div>Automation not found</div>;
  }

  const handleStatusToggle = () => {
    // Optimistically update the UI
    queryClient.setQueryData(
      ["email-automation", automationId],
      (old: any) => ({
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            is_active: !transformedAutomation.is_active,
          },
        },
      }),
    );

    // Make the API call
    updateEmailAutomationAction({
      automation_id: automationId,
      automation_data: {
        id: automationId,
        is_active: !transformedAutomation.is_active,
      },
    })
      .then(() => {
        // Refetch to ensure we have the latest data
        queryClient.invalidateQueries({
          queryKey: ["email-automation", automationId],
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
                is_active: transformedAutomation.is_active,
              },
            },
          }),
        );
        toast({
          title: "Error",
          description: "Failed to update automation status. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleDeleteLink = () => {
    // TODO: Implement delete link
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
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background">
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
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleStatusToggle}
                  disabled={isUpdatingStatus}
                  className="cursor-pointer"
                >
                  {editedLinkStatus === "active" ? (
                    <>
                      <DisableLink /> Disable
                    </>
                  ) : (
                    <>
                      <LinkIcon /> Enable
                    </>
                  )}
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
                      <DialogTitle>Delete Link</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this link? This action
                        cannot be undone.
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
                        onClick={handleDeleteLink}
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
                <Button
                  className="h-fit w-full cursor-pointer bg-foreground text-background transition-colors hover:bg-foreground/90"
                  onClick={() => setIsSheetOpen(true)}
                >
                  <div className="flex w-full flex-row items-center justify-between space-y-0 px-3 py-6 pl-6 text-left">
                    <div className="p-0">
                      <div className="text-lg font-medium">
                        Automation Steps
                      </div>
                      <div className="text-sm text-secondary">
                        Manage the steps of this automation.
                      </div>
                    </div>
                    <div className="flex h-9 items-center justify-center rounded-md bg-primary px-4 py-1 text-center text-sm">
                      Edit
                    </div>
                  </div>
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
                />
              </SheetContent>
            </>
          </Sheet>
          <h2 className="text-2xl font-bold">People</h2>
          <p>Table here with active steps, people, etc.</p>
        </div>
      </div>
    </div>
  );
}
