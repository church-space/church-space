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
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const automationId = parseInt(params.automationId as string, 10);
  const { organizationId } = useUser();
  const isMobile = useIsMobile();

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

  // Update the state when automation data is loaded
  useEffect(() => {
    if (automation) {
      setEditedLinkName(automation.data?.name || "");
      setEditedLinkDescription(automation.data?.description || "");
    }
  }, [automation]);

  if (isLoadingAutomation) {
    return <div>Loading...</div>;
  }

  if (!automation) {
    return <div>Automation not found</div>;
  }

  const handleStatusToggle = () => {
    // TODO: Implement status toggle
  };

  const handleDeleteLink = () => {
    // TODO: Implement delete link
  };

  const cancelEditingLink = () => {
    setIsEditingLink(false);
    // TODO: Implement cancel editing link
  };

  const saveEditedLink = () => {
    setIsEditingLink(false);
    // TODO: Implement save edited link
  };

  const startEditingLink = () => {
    setIsEditingLink(true);
    // TODO: Implement start editing link
  };

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Link prefetch={true} href="/emails/automations">
                  Automations
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{automation.data?.name}</BreadcrumbPage>
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
                    <h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
                      {automation.data?.name}
                    </h2>
                    {editedLinkStatus === "inactive" && (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                  <Edit className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-muted-foreground">
                  {automation.data?.description}
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
          <Sheet>
            <>
              <SheetTrigger asChild>
                <Button className="h-fit w-full cursor-pointer bg-foreground text-background transition-colors hover:bg-foreground/90">
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
                className="h-[95%] w-full md:h-full md:max-w-3xl"
                side={isMobile ? "bottom" : "right"}
              >
                <AutomationBuilder organizationId={organizationId ?? ""} />
              </SheetContent>
            </>
          </Sheet>
          <h2 className="text-2xl font-bold">People</h2>
          <p>Table here with active steps, people, etc.</p>
        </div>
      </div>
    </>
  );
}
