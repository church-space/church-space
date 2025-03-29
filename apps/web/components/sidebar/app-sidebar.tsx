"use client";

import { Link, List, Mail, QrCode, Settings2, User } from "lucide-react";
import * as React from "react";

import { Button } from "@church-space/ui/button";
import { ChurchSpaceBlack, CircleQuestion } from "@church-space/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@church-space/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
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
          title: "Link Lists",
          url: "/links",
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
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ChurchSpaceBlack height={"30"} width={"30"} />
          </div>
          <NavUser />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="flex justify-center text-muted-foreground">
        <Button
          className="size-7 gap-0 rounded-full p-0 text-muted-foreground [&_svg]:size-5"
          variant="ghost"
        >
          <CircleQuestion height={"18"} width={"18"} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
