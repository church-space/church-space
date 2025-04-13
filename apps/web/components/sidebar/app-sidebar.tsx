"use client";

import Link from "next/link";
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
  LinkFilled,
  Email,
  Users,
  Settings,
  Qrcode,
  HandWave,
  XIcon,
  ChevronRight,
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
import NewQRCode from "../forms/new-qr-code";
import { useUser } from "@/stores/use-user";

const data = {
  navMain: [
    {
      title: "Email",
      url: "/emails",
      icon: Email,
      submenu: [
        {
          title: "All Emails",
          url: "/emails",
        },
        {
          title: "Templates",
          url: "/emails/templates",
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
      url: "/qr-codes",
      icon: LinkFilled,
      submenu: [
        {
          title: "QR Codes",
          url: "/qr-codes",
        },
        {
          title: "Link Lists",
          url: "/link-lists",
        },
      ],
    },

    {
      title: "People",
      url: "/people",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
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
  const [newQrCodeDialogOpen, setNewQrCodeDialogOpen] = useState(false);

  const { organizationId } = useUser();

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <Link href="/emails" prefetch={true}>
              <div className="flex items-center gap-0.5">
                <ChurchSpaceBlack height={"22"} width={"22"} />
                <span className="text-sm font-bold">ChurchSpace</span>
              </div>
            </Link>
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
                onClick={() => setNewQrCodeDialogOpen(true)}
              >
                <NewQrCode />
                New QR Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter className="flex w-full flex-col rounded-md bg-primary/10 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <HandWave /> Welcome
            </div>
            <Button variant="ghost" size="icon">
              <XIcon />
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5 text-sm">Item One</div>
            <div className="flex gap-1.5 text-sm">Item One</div>
            <div className="flex gap-1.5 text-sm">
              View All <ChevronRight />
            </div>
          </div>
          <div className="ml-7 hidden translate-y-0.5 text-sm text-muted-foreground md:block">
            Click &quot;?&quot; for Support
          </div>
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
            organizationId={organizationId ?? ""}
            setIsNewEmailOpen={setNewEmailDialogOpen}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={newQrCodeDialogOpen} onOpenChange={setNewQrCodeDialogOpen}>
        <DialogContent className="max-w-[95%] rounded-lg p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="flex items-center gap-1">
              <Qrcode height={"20"} width={"20"} /> Create New QR Code
            </DialogTitle>
          </DialogHeader>
          <NewQRCode
            organizationId={organizationId ?? ""}
            setIsNewQRCodeOpen={setNewQrCodeDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
