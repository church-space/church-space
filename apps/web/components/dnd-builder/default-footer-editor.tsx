"use client";

import { getDefaultEmailFooter } from "@/actions/get-default-email-footer";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { getOrgFooterDetailsAction } from "@/actions/get-org-footer-details";
import Link from "next/link";
import { Button } from "@church-space/ui/button";
import { Skeleton } from "@church-space/ui/skeleton";

type FooterData = {
  links: any | null;
  extra_links: any | null;
  logo: string | null;
  name: string | null;
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
    links: null,
    extra_links: null,
    logo: null,
    name: null,
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

  const { data: orgFooterDetails, isLoading: isOrgFooterDetailsLoading } =
    useQuery({
      queryKey: ["org-footer-details", organizationId],
      queryFn: async () => {
        const result = await getOrgFooterDetailsAction({ organizationId });
        return result?.data;
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
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 pr-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/emails" className="hidden md:block">
                <BreadcrumbItem>Emails</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <Link href="/emails/templates" className="hidden md:block">
                <BreadcrumbItem>Templates</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  Footer
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Link href="/emails/templates">
          <Button size="sm">Save and Exit</Button>
        </Link>
      </header>

      <div className="relative hidden p-2 pt-0 md:flex md:gap-4 md:p-4 md:pt-0">
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
          {isOrgFooterDetailsLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <Footer
              onClick={() => {}}
              isActive={false}
              showHover={false}
              footerData={footerData}
              emailInset={true}
              emailBgColor={emailBgColor}
              defaultFont={defaultFont}
              orgFooterDetails={orgFooterDetails}
            />
          )}
        </div>
      </div>
      <div className="mx-4 mt-4 flex flex-col gap-4 rounded-lg border bg-muted p-2 md:hidden">
        <h2 className="text-lg font-bold">Mobile Editing Coming Soon</h2>
        <p className="text-sm text-muted-foreground">
          It looks like you&apos;re on a device with a smaller screen. Editing
          the default footer is not avaible on mobile yet, but it is coming
          soon.
        </p>
        <Link href="/emails/templates">
          <Button variant="outline" className="mt-1 w-full">
            Back to Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
