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
import { useQueryClient } from "@tanstack/react-query";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
    prefetchQueryKey?: string[];
    submenu?: {
      title: string;
      url: string;
      prefetchQueryKey?: string[];
    }[];
  }[];
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleMouseEnter = (prefetchQueryKey?: string[]) => {
    if (prefetchQueryKey) {
      queryClient.prefetchQuery({
        queryKey: prefetchQueryKey,
      });
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
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
                <Link
                  href={item.url}
                  prefetch={true}
                  onMouseEnter={() => handleMouseEnter(item.prefetchQueryKey)}
                >
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
                          (item.title === "Settings"
                            ? pathname === submenuItem.url
                            : item.title === "Email"
                              ? submenuItem.url === "/emails"
                                ? pathname === "/emails" ||
                                  (pathname.startsWith("/emails/") &&
                                    !pathname.startsWith("/emails/templates") &&
                                    !pathname.startsWith(
                                      "/emails/automations",
                                    ) &&
                                    !pathname.startsWith("/emails/categories"))
                                : pathname.startsWith(submenuItem.url)
                              : pathname === submenuItem.url ||
                                pathname.startsWith(submenuItem.url + "/")) &&
                            "text-foreground",
                        )}
                      >
                        <Link
                          href={submenuItem.url}
                          prefetch={true}
                          onMouseEnter={() =>
                            handleMouseEnter(submenuItem.prefetchQueryKey)
                          }
                        >
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
