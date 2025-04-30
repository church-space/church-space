"use client";

import { cn } from "@church-space/ui/cn";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@church-space/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getEmails } from "@/actions/get-emails";
import { getLinkLists } from "@/actions/get-link-lists";
import { getPeopleWithEmails } from "@/actions/get-people-with-emails";
import { getEmailTemplates } from "@/actions/get-email-templates";
import { getEmailAutomations } from "@/actions/get-email-automations";
import { getEmailCategories } from "@/actions/get-all-email-categories";
import { getQrLinks } from "@/actions/get-qr-links";
import { useUser } from "@/stores/use-user";
import { useCallback } from "react";
import { useInView } from "react-intersection-observer";
import React from "react";

// NavItem wrapper component that handles intersection observer
function NavItem({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { prefetchData } = NavMain.useNavContext();

  // Prefetch data when item comes into view
  React.useEffect(() => {
    if (inView) {
      prefetchData(url);
    }
  }, [inView, url, prefetchData]);

  return <div ref={ref}>{children}</div>;
}

// Context for sharing prefetchData function
const NavContext = React.createContext<{ prefetchData: (url: string) => void }>(
  { prefetchData: () => {} },
);

// Custom hook to use nav context
NavMain.useNavContext = () => React.useContext(NavContext);

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
      disabled?: boolean;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { organizationId } = useUser();
  // Track which routes we've already prefetched
  const prefetchedRoutes = React.useRef(new Set<string>());

  const prefetchEmails = useCallback(async () => {
    try {
      const result = await getEmails({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch emails");
      }

      const data = {
        pages: [
          {
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
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["emails", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching emails:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchLinkLists = useCallback(async () => {
    try {
      const result = await getLinkLists({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch link pages");
      }

      const data = {
        pages: [
          {
            data:
              result.data.data?.map((linkList) => ({
                ...linkList,
              })) ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["link-lists", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching link pages:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchPeople = useCallback(async () => {
    try {
      const result = await getPeopleWithEmails({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch people");
      }

      const data = {
        pages: [
          {
            data:
              result.data.data?.map((person) => ({
                ...person,
              })) ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["people", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching people:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchEmailTemplates = useCallback(async () => {
    try {
      const result = await getEmailTemplates({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch email templates");
      }

      const data = {
        pages: [
          {
            data: result.data.data ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["email-templates", organizationId, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching email templates:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchEmailAutomations = useCallback(async () => {
    try {
      const result = await getEmailAutomations({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch email automations");
      }

      const data = {
        pages: [
          {
            data:
              result.data.data?.map((emailAutomation) => ({
                ...emailAutomation,
              })) ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["email-automations", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching email automations:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchEmailCategories = useCallback(async () => {
    try {
      const result = await getEmailCategories({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch email categories");
      }

      const data = {
        pages: [
          {
            data: result.data.data ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["email-categories", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching email categories:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchQrCodes = useCallback(async () => {
    try {
      const result = await getQrLinks({
        organizationId: organizationId ?? "",
        page: 0,
      });

      if (!result?.data) {
        throw new Error("Failed to fetch QR codes");
      }

      const data = {
        pages: [
          {
            data:
              result.data.data?.map((qrLink) => ({
                ...qrLink,
              })) ?? [],
            nextPage: result.data.nextPage,
          },
        ],
        pageParams: [0],
      };

      queryClient.setQueryData(
        ["qr-links", organizationId, undefined, undefined],
        data,
      );
    } catch (error) {
      console.error("Error prefetching QR codes:", error);
    }
  }, [organizationId, queryClient]);

  const prefetchData = useCallback(
    (url?: string) => {
      if (
        !url ||
        !organizationId ||
        (url && pathname === url) ||
        prefetchedRoutes.current.has(url)
      ) {
        return;
      }

      // Mark this route as prefetched
      prefetchedRoutes.current.add(url);

      // Fire and forget prefetching - don't await the results
      if (url === "/emails") {
        prefetchEmails().catch(console.error);
      } else if (url === "/link-pages") {
        prefetchLinkLists().catch(console.error);
      } else if (url === "/people") {
        prefetchPeople().catch(console.error);
      } else if (url === "/emails/templates") {
        prefetchEmailTemplates().catch(console.error);
      } else if (url === "/emails/automations") {
        prefetchEmailAutomations().catch(console.error);
      } else if (url === "/emails/categories") {
        prefetchEmailCategories().catch(console.error);
      } else if (url === "/qr-codes") {
        prefetchQrCodes().catch(console.error);
      }
    },
    [
      organizationId,
      pathname,
      prefetchEmails,
      prefetchLinkLists,
      prefetchPeople,
      prefetchEmailTemplates,
      prefetchEmailAutomations,
      prefetchEmailCategories,
      prefetchQrCodes,
      prefetchedRoutes,
    ],
  );

  return (
    <NavContext.Provider value={{ prefetchData }}>
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
                <NavItem url={item.url}>
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
                      scroll={false}
                      shallow={true}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </NavItem>
                {item.submenu && isActive && (
                  <SidebarMenuSub className="gap-0">
                    {item.submenu
                      ?.filter((submenuItem) => !submenuItem.disabled)
                      .map((submenuItem) => (
                        <SidebarMenuItem key={submenuItem.title}>
                          <NavItem url={submenuItem.url}>
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
                                          !pathname.startsWith(
                                            "/emails/templates",
                                          ) &&
                                          !pathname.startsWith(
                                            "/emails/automations",
                                          ) &&
                                          !pathname.startsWith(
                                            "/emails/categories",
                                          ))
                                      : pathname.startsWith(submenuItem.url)
                                    : pathname === submenuItem.url ||
                                      pathname.startsWith(
                                        submenuItem.url + "/",
                                      )) && "text-foreground",
                              )}
                            >
                              <Link
                                href={submenuItem.url}
                                prefetch={true}
                                scroll={false}
                                shallow={true}
                              >
                                <span>{submenuItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </NavItem>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </NavContext.Provider>
  );
}
