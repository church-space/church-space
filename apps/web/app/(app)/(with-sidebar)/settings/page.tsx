import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import SubscribeModal from "@/components/stripe/subscribe-modal";
import { cookies } from "next/headers";
import { createClient } from "@church-space/supabase/server";
import SettingsSettings from "@/components/settings/settings-settings";

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    return <div>Not logged in</div>;
  }
  if (!organizationId) {
    return <div>No organization selected</div>;
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Hillsong Church Online</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        organization (PCO Connection), billing, profile, domains
        <SubscribeModal organizationId={organizationId} userId={user.id} />
        <SettingsSettings
          title="Plan and Billing"
          description="Manage your plan and billing information"
          sections={[
            {
              title: "Email Plan",
              description: "Manage your plan",
              actionType: "select",
              actionLabel: "Change Plan",
              selectOptions: [
                { label: "Basic", value: "basic" },
                { label: "Pro", value: "pro" },
                { label: "Enterprise", value: "enterprise" },
              ],
            },
            {
              title: "Links Plan",
              description: "Manage your links plan",
              actionType: "select",
              actionLabel: "Change Plan",
              selectOptions: [
                { label: "Basic", value: "basic" },
                { label: "Pro", value: "pro" },
                { label: "Enterprise", value: "enterprise" },
              ],
            },
            {
              title: "Billing",
              description: "Manage your billing information",
              actionType: "button",
              actionLabel: "Change Plan",
              buttonLink:
                "https://billing.stripe.com/p/login/test_28o4ic2eJ4zw8F2144",
            },
          ]}
        />
      </div>
    </>
  );
}
