"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@/stores/use-user";
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
  Email,
  HandWave,
  LinkFilled,
  NewEmail as NewEmailIcon,
  NewQrCode,
  Qrcode,
  Settings,
  Users,
  XIcon,
} from "@church-space/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@church-space/ui/sidebar";
import cookies from "js-cookie";
import NewEmail from "../forms/new-email";
import NewQRCode from "../forms/new-qr-code";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { updateUserPreferencesAction } from "@/actions/update-user-preferences";

const data = (role: string | null) => {
  return {
    navMain: [
      {
        title: "Emails",
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
            title: "Link Pages",
            url: "/link-pages",
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
            title: "My Account",
            url: "/settings",
          },
          {
            title: "Organization",
            url: "/settings/organization",
            disabled: role !== "owner",
          },
          {
            title: "Branding",
            url: "/settings/brand-colors",
          },
          {
            title: "Plan and Billing",
            url: "/settings/billing",
            disabled: role !== "owner",
          },
          {
            title: "Domains",
            url: "/settings/domains",
            disabled: role !== "owner",
          },
        ],
      },
    ],
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [newEmailDialogOpen, setNewEmailDialogOpen] = useState(false);
  const [newQrCodeDialogOpen, setNewQrCodeDialogOpen] = useState(false);
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const { organizationId, preferences, role, user } = useUser();

  const handleWelcomeDialogClose = () => {
    setWelcomeDialogOpen(false);
    cookies.set("welcomeDialogOpen", "false");

    updateUserPreferencesAction({
      userId: user?.id ?? "",
      preferences: {
        welcomeStepsCompleted: true,
        productUpdateEmails: preferences?.productUpdateEmails ?? true,
      },
    });
  };

  const handleNewQrCodeOpen = useCallback((value: boolean) => {
    setNewQrCodeDialogOpen(value);
  }, []);

  useEffect(() => {
    // Don't do anything until preferences are properly loaded
    if (!preferences || preferences.welcomeStepsCompleted === null) {
      setPreferencesLoaded(false);
      return;
    }

    setPreferencesLoaded(true);

    // If welcome steps are completed, don't show the dialog
    if (preferences.welcomeStepsCompleted === true) {
      setWelcomeDialogOpen(false);
      return;
    }

    // Otherwise check cookie and show dialog if needed
    const welcomeCookie = cookies.get("welcomeDialogOpen");
    setWelcomeDialogOpen(welcomeCookie !== "false");
  }, [preferences]);

  return (
    <>
      <Sidebar variant="inset" className="px-0" {...props}>
        <SidebarHeader className="px-3 pl-3.5">
          <div className="flex w-full items-center justify-between gap-2">
            <Link href="/emails" prefetch={true}>
              <div className="flex items-center gap-0.5">
                <ChurchSpaceBlack height={"22"} width={"22"} />
                <span className="text-sm font-bold">Church Space</span>
              </div>
            </Link>
            <NavUser />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mx-2 mt-2 h-8 shadow-md" variant="default">
                Create New
              </Button>
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
          <NavMain items={data(role).navMain} />
        </SidebarContent>
        <AnimatePresence>
          {preferencesLoaded &&
          welcomeDialogOpen &&
          (preferences?.welcomeStepsCompleted === false ||
            preferences?.welcomeStepsCompleted === undefined) ? (
            <SidebarFooter>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="flex w-full flex-col rounded-md border border-primary bg-primary/10 p-2"
              >
                <div className="flex w-full items-center justify-between gap-2 pb-1.5">
                  <Link href="/welcome" className="w-full">
                    <div className="flex flex-1 items-center gap-1.5 text-sm font-medium">
                      <HandWave height={"16"} width={"16"} /> Welcome
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={() => handleWelcomeDialogClose()}
                  >
                    <XIcon />
                  </Button>
                </div>
                <Link href="/welcome" className="w-full">
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    Looking for where to start? Click here for some ideas.
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="ml-8 hidden translate-y-0.5 text-sm text-muted-foreground md:block"
              >
                Click &quot;?&quot; for Support
              </motion.div>
            </SidebarFooter>
          ) : null}
        </AnimatePresence>
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
            setIsNewQRCodeOpen={handleNewQrCodeOpen}
            isSidebar={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
