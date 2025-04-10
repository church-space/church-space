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
import { getEmails } from "@/actions/get-emails";
import { getLinkLists } from "@/actions/get-link-lists";
import { getPeopleWithEmails } from "@/actions/get-people-with-emails";
import { useUser } from "@/stores/use-user";
import { useInView } from "react-intersection-observer";
import { useCallback, useEffect } from "react";

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
      prefetchQueryKey?: string[];
    }[];
  }[];
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { organizationId } = useUser();

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });

  const prefetchEmails = useCallback(async () => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["emails", organizationId, undefined, undefined],
      queryFn: async ({ pageParam = 0 }) => {
        const result = await getEmails({
          organizationId: organizationId ?? "",
          page: pageParam,
        });

        if (!result?.data) {
          throw new Error("Failed to fetch emails");
        }

        return {
          data:
            result.data.data?.map((email) => ({
              ...email,
              from_domain: email.from_domain as unknown as {
                domain: string;
              } | null,
              reply_to_domain: email.reply_to_domain as unknown as {
                domain: string;
              } | null,
            })) ?? [],
          count: result.data.count ?? 0,
          nextPage: result.data.nextPage,
        };
      },
      initialPageParam: 0,
    });
  }, [organizationId, queryClient]);

  const prefetchLinkLists = useCallback(async () => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["link-lists", organizationId, undefined, undefined],
      queryFn: async ({ pageParam = 0 }) => {
        const result = await getLinkLists({
          organizationId: organizationId ?? "",
          page: pageParam,
        });

        if (!result?.data) {
          throw new Error("Failed to fetch link lists");
        }

        return {
          data:
            result.data.data?.map((linkList) => ({
              ...linkList,
            })) ?? [],
          count: result.data.count ?? 0,
          nextPage: result.data.nextPage,
        };
      },
      initialPageParam: 0,
    });
  }, [organizationId, queryClient]);

  const prefetchPeople = useCallback(async () => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: ["people", organizationId, undefined, undefined],
      queryFn: async ({ pageParam = 0 }) => {
        const result = await getPeopleWithEmails({
          organizationId: organizationId ?? "",
          page: pageParam,
        });

        if (!result?.data) {
          throw new Error("Failed to fetch people");
        }

        return {
          data:
            result.data.data?.map((person) => ({
              ...person,
            })) ?? [],
          count: result.data.count ?? 0,
          nextPage: result.data.nextPage,
        };
      },
      initialPageParam: 0,
    });
  }, [organizationId, queryClient]);

  const prefetchData = useCallback(
    async (url?: string) => {
      if (!url || !organizationId || (url && pathname === url)) {
        return;
      }

      try {
        if (url === "/emails") {
          await prefetchEmails();
        } else if (url === "/link-lists") {
          await prefetchLinkLists();
        } else if (url === "/people") {
          await prefetchPeople();
        }
      } catch (error) {
        console.error("Error prefetching data:", error);
      }
    },
    [
      organizationId,
      pathname,
      prefetchEmails,
      prefetchLinkLists,
      prefetchPeople,
    ],
  );

  useEffect(() => {
    if (inView) {
      items.forEach((item) => {
        prefetchData(item.url);
        item.submenu?.forEach((submenuItem) => {
          prefetchData(submenuItem.url);
        });
      });
    }
  }, [inView, items, prefetchData]);

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
                <Link href={item.url} prefetch={true} ref={inViewRef}>
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
                          ref={inViewRef}
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
