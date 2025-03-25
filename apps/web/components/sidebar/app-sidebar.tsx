"use client";

import {
  Command,
  Home,
  Link,
  Mail,
  Settings2,
  User,
  QrCode,
  List,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@church-space/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Emails",
      url: "/emails",
      icon: Mail,
      submenu: [
        {
          title: "Emails",
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
          title: "Lists and Categories",
          url: "/emails/categories",
        },
      ],
    },
    {
      title: "Links",
      url: "/links",
      icon: Link,
      submenu: [
        {
          title: "QR Codes",
          url: "/qr-codes",
          icon: QrCode,
        },
        {
          title: "Link Lists",
          url: "/link-lists",
          icon: List,
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
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
