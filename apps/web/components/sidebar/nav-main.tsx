"use client";

import { cn } from "@church-space/ui/cn";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@church-space/ui/sidebar";
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
    isActive?: boolean;
    submenu?: {
      title: string;
      url: string;
      icon: React.ElementType;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            className={cn(item.isActive && "bg-sidebar-accent")}
            key={item.title}
          >
            <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
            {item.submenu && (
              <SidebarMenuSub>
                {item.submenu?.map((submenuItem) => (
                  <SidebarMenuItem key={submenuItem.title}>
                    <SidebarMenuButton asChild tooltip={submenuItem.title}>
                      <a href={submenuItem.url}>
                        <submenuItem.icon />
                        <span>{submenuItem.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
