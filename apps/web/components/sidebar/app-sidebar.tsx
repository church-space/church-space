"use client";

import {
  Command,
  Home,
  Link,
  Mail,
  Settings2,
  User,
  Waypoints,
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
      isActive: true,
    },
    {
      title: "Emails",
      url: "/emails",
      icon: Mail,
    },
    {
      title: "Automations",
      url: "/automations",
      icon: Waypoints,
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
      title: "Courses",
      url: "/courses",
      icon: Link,
    },
    // {
    //   title: "Content",
    //   url: "/content",
    //   icon: BookOpen,
    // },
    // {
    //   title: "Forms",
    //   url: "/forms",
    //   icon: Clipboard,
    // },

    {
      title: "People",
      url: "/people",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
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
