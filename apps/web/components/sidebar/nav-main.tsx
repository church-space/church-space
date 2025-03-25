"use client";

import { cn } from "@church-space/ui/cn";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@church-space/ui/sidebar";
import Link from "next/link";

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
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              className={cn(
                "rounded-lg text-muted-foreground hover:text-foreground",
                item.isActive &&
                  "border border-muted-foreground/10 bg-muted text-foreground shadow-sm",
                !item.isActive && "hover:bg-transparent",
              )}
            >
              <Link href={item.url} prefetch={true}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {item.submenu && item.isActive && (
              <SidebarMenuSub className="gap-0">
                {item.submenu?.map((submenuItem) => (
                  <SidebarMenuItem key={submenuItem.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={submenuItem.title}
                      className={cn(
                        "py-0 text-muted-foreground hover:bg-transparent hover:text-foreground",
                        item.isActive && "text-foreground",
                      )}
                    >
                      <a href={submenuItem.url}>
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
