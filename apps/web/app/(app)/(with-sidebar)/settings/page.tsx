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
import DomainManagement from "@/components/domains/domain-managament";
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";

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

  const domains = await getDomainsQuery(supabase, organizationId);

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
      <div className="flex flex-1 flex-col gap-16 p-4 pt-0">
        organization (PCO Connection), profile
        <SettingsSettings
          title="Integrations"
          description="Connect Church Space to your other tools"
          sections={[
            {
              title: "Planning Center",
              description: "Connected on 23/03/2025 by John Doe",
              actionType: "button",
              actionLabel: "Connect/Disconnect",
            },
          ]}
        />
        <SubscribeModal organizationId={organizationId} userId={user.id} />
        <SettingsSettings
          title="Billing"
          descriptionObject={
            <p className="pl-1 text-sm text-muted-foreground">
              If you need help with billing,
              <a
                className="rounded-md px-0.5 font-bold transition-colors hover:bg-muted"
                href="mailto:support@churchspace.co?subject=Billing%20Support"
              >
                contact us.
              </a>
            </p>
          }
          sections={[
            {
              title: "Current Plan",
              description: "Manage your plan",
              actionType: "select",
              actionLabel: "Change Plan",
              selectOptions: [
                { label: "Free - 250 Emails Per Month", value: "250" },
                { label: "$8 - 5,000 Emails Per Month", value: "5000" },
                { label: "$16 - 10,000 Emails Per Month", value: "10000" },
                { label: "$32 - 20,000 Emails Per Month", value: "20000" },
                { label: "$56 - 35,000 Emails Per Month", value: "35000" },
                { label: "$80 - 50,000 Emails Per Month", value: "50000" },
                { label: "$120 - 75,000 Emails Per Month", value: "75000" },
                { label: "$160 - 100,000 Emails Per Month", value: "100000" },
                { label: "$240 - 150,000 Emails Per Month", value: "150000" },
                { label: "$320 - 200,000 Emails Per Month", value: "200000" },
                { label: "$400 - 250,000 Emails Per Month", value: "250000" },
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
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-0">
          <h2 className="pl-1 text-lg font-bold">Domains</h2>
          <p className="pl-1 text-sm text-muted-foreground">
            Manage your domains and DNS records.
          </p>
          <DomainManagement
            organizationId={organizationId}
            initialDomains={domains?.data || []}
          />
        </div>
      </div>
    </>
  );
}
