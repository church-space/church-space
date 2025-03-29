"use client";
import React, { useState } from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Label } from "@church-space/ui/label";
import { Input } from "@church-space/ui/input";
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
import { Edit, Ellipsis, Trash } from "lucide-react";

export default function Page() {
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editedLinkName, setEditedLinkName] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("");
  const [isDeletingLink, setIsDeletingLink] = useState(false);

  const linkListData = {
    private_name: "Test Link List",
    slug: "test-link-list",
  };

  const startEditingLink = () => {
    setIsEditingLink(true);
    setEditedLinkName(linkListData.private_name);
    setEditedLinkUrl(linkListData.slug);
  };

  const cancelEditingLink = () => {
    setIsEditingLink(false);
  };

  const saveEditedLink = () => {
    setIsEditingLink(false);
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
                <BreadcrumbLink href="/links">Links Lists</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Link Page ID</BreadcrumbPage>
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
                    Link Name
                  </Label>
                  <Input
                    id="edit-link-name"
                    value={editedLinkName}
                    onChange={(e) => setEditedLinkName(e.target.value)}
                    placeholder="Enter a name for this link"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="edit-link-url" className="mb-2 block">
                    Destination URL
                  </Label>
                  <Input
                    id="edit-link-url"
                    value={editedLinkUrl}
                    onChange={(e) => setEditedLinkUrl(e.target.value)}
                    placeholder="Enter the destination URL"
                  />
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
                  <h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
                    {linkListData?.private_name || "Loading..."}
                  </h2>
                  <Edit className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-muted-foreground">
                  {linkListData?.slug || "Loading..."}
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
                      <Button variant="destructive">Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
