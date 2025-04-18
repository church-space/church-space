"use client";

import { getDefaultEmailFooter } from "@/actions/get-default-email-footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { cn } from "@church-space/ui/cn";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "./footer";
import { useUpdateOrgDefaultFooter } from "./mutations/use-update-org-default-footer";
import DefaultEmailFooterForm from "./sidebar-editor-forms/default-email-footer";

type FooterData = {
  address: string | null;
  copyright_name: string | null;
  links: any | null;
  logo: string | null;
  name: string | null;
  reason: string | null;
  socials_color: string | null;
  socials_icon_color: string | null;
  socials_style: "outline" | "filled" | "icon-only";
  subtitle: string | null;
};

export default function DefaultFooterEditor({
  organizationId,
  emailBgColor = "#ffffff",
  defaultFont = "sans",
}: {
  organizationId: string;
  emailBgColor?: string;
  defaultFont?: string;
}) {
  const [footerData, setFooterData] = useState<FooterData>({
    address: null,
    copyright_name: null,
    links: null,
    logo: null,
    name: null,
    reason: null,
    socials_color: null,
    socials_icon_color: null,
    socials_style: "outline",
    subtitle: null,
  });

  const { data } = useQuery({
    queryKey: ["default-footer", organizationId],
    queryFn: async () => {
      try {
        const result = await getDefaultEmailFooter({ organizationId });
        if (!result?.data) return undefined;
        return result.data.footer;
      } catch {
        return undefined;
      }
    },
  });

  useEffect(() => {
    if (data) {
      setFooterData(data);
    }
  }, [data]);

  const updateOrgDefaultFooter = useUpdateOrgDefaultFooter();

  // Function to update footer on the server
  const updateFooterOnServer = useCallback(
    (updatedFooter: FooterData) => {
      updateOrgDefaultFooter.mutate({
        organizationId,
        updates: updatedFooter,
      });
    },
    [organizationId, updateOrgDefaultFooter],
  );

  // Create a ref for footer update debouncing
  const debouncedFooterUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Handle footer changes locally before sending to server
  const handleFooterChange = (updatedFooter: FooterData) => {
    setFooterData(updatedFooter);

    // Debounce the server update
    if (debouncedFooterUpdateRef.current) {
      clearTimeout(debouncedFooterUpdateRef.current);
    }

    debouncedFooterUpdateRef.current = setTimeout(() => {
      updateFooterOnServer(updatedFooter);
    }, 500);
  };

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails/templates">
                  Templates
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  Footer
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="relative flex p-2 pt-0 md:gap-4 md:p-4 md:pt-0">
        <div className="hidden md:block">
          <div
            className={cn(
              "sticky top-16 h-[calc(100vh-5rem)] flex-shrink-0 overflow-hidden overflow-y-auto rounded-md border bg-sidebar p-4 shadow-sm md:w-[320px] lg:w-[400px]",
            )}
          >
            <DefaultEmailFooterForm
              footerData={footerData}
              onFooterChange={handleFooterChange}
            />
          </div>
        </div>
        <div className="relative flex-1">
          <Footer
            onClick={() => {}}
            isActive={false}
            showHover={false}
            footerData={footerData}
            emailInset={true}
            emailBgColor={emailBgColor}
            defaultFont={defaultFont}
          />
        </div>
      </div>
    </div>
  );
}
