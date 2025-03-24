"use client";

import {
  CreditCard,
  Globe,
  Organization,
  Settings,
} from "@church-space/ui/icons";
import * as React from "react";

import { ChevronLeft } from "@church-space/ui/icons";
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
      title: "Preferences",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Organization",
      url: "/settings/organization",
      icon: Organization,
      isActive: true,
    },
    {
      title: "Plan and Billing",
      url: "/settings/billing",
      icon: CreditCard,
    },

    {
      title: "Domains",
      url: "/settings/domains",
      icon: Globe,
    },
  ],
};

export function SettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="/home">
              <SidebarMenuButton className="gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft /> Back to App
              </SidebarMenuButton>
            </a>
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
