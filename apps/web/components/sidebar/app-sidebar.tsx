"use client";

import { Link, List, Mail, QrCode, Settings2, User } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@church-space/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import {
  ChurchSpaceBlack,
  NewEmail as NewEmailIcon,
  NewQrCode,
} from "@church-space/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@church-space/ui/sidebar";
import NewEmail from "../forms/new-email";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import SidebarHelpMenu from "./sidebar-help-menu";

const data = {
  navMain: [
    {
      title: "Email",
      url: "/emails",
      icon: Mail,
      submenu: [
        {
          title: "All Emails",
          url: "/emails",
        },
        {
          title: "Templates",
          url: "/ ",
        },
        {
          title: "Automations",
          url: "/emails/automations",
        },
        {
          title: "Categories",
          url: "/emails/categories",
        },
      ],
    },
    {
      title: "Links",
      url: "/link-lists",
      icon: Link,
      submenu: [
        {
          title: "Link Lists",
          url: "/link-lists",
          icon: List,
        },
        {
          title: "QR Codes",
          url: "/qr-codes",
          icon: QrCode,
        },
      ],
    },

    {
      title: "People",
      url: "/people",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      submenu: [
        {
          title: "Preferences",
          url: "/settings",
        },
        {
          title: "Organization",
          url: "/settings/organization",
        },
        {
          title: "Plan and Billing",
          url: "/settings/billing",
        },
        {
          title: "Domains",
          url: "/settings/domains",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [newEmailDialogOpen, setNewEmailDialogOpen] = useState(false);

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-0.5">
              <ChurchSpaceBlack height={"22"} width={"22"} />
              <span className="text-sm font-bold">ChurchSpace</span>
            </div>
            <NavUser />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mx-2 mt-2 h-8 shadow-md">Create New</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
              <DropdownMenuItem
                className="w-full"
                onClick={() => setNewEmailDialogOpen(true)}
              >
                <NewEmailIcon />
                New Email
              </DropdownMenuItem>
              <DropdownMenuItem
                className="w-full"
                onClick={() => setNewEmailDialogOpen(true)}
              >
                <NewQrCode />
                New QR Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter className="flex justify-center text-muted-foreground">
          <SidebarHelpMenu />
        </SidebarFooter>
      </Sidebar>
      <Dialog open={newEmailDialogOpen} onOpenChange={setNewEmailDialogOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <NewEmailIcon />
              Create New Email
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              What&apos;s the subject of your email? You can always change it
              later.
            </DialogDescription>
          </DialogHeader>
          <NewEmail
            organizationId={"43d2f23f-82a8-4eca-b6de-174ca0f9a1a0"}
            setIsNewEmailOpen={setNewEmailDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
