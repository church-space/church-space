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
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
    submenu?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          // Main item is active if:
          // 1. It's the exact route (e.g. /emails)
          // 2. OR we're on any route under it (e.g. /emails/70)
          // 3. OR any of its subitems are active
          const isActive =
            pathname === item.url ||
            pathname.startsWith(item.url + "/") ||
            (item.submenu?.some(
              (sub) =>
                pathname === sub.url || pathname.startsWith(sub.url + "/"),
            ) ??
              false);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "rounded-lg text-muted-foreground hover:text-foreground",
                  isActive &&
                    "border border-muted-foreground/20 bg-background text-foreground shadow-sm",
                  !isActive && "hover:bg-transparent",
                )}
              >
                <Link href={item.url} prefetch={true}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.submenu && isActive && (
                <SidebarMenuSub className="gap-0">
                  {item.submenu?.map((submenuItem) => (
                    <SidebarMenuItem key={submenuItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={submenuItem.title}
                        className={cn(
                          "py-0 text-muted-foreground hover:bg-transparent hover:text-foreground",
                          // For "All Emails", also active if we're on a dynamic route under /emails
                          // For Settings, only exact matches
                          (item.title === "Settings"
                            ? pathname === submenuItem.url
                            : pathname === submenuItem.url ||
                              pathname.startsWith(submenuItem.url + "/") ||
                              (submenuItem.url === "/emails" &&
                                pathname.startsWith("/emails/") &&
                                !pathname.startsWith("/emails/templates") &&
                                !pathname.startsWith("/emails/automations") &&
                                !pathname.startsWith("/emails/categories"))) &&
                            "text-foreground",
                        )}
                      >
                        <Link href={submenuItem.url} prefetch={true}>
                          <span>{submenuItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
