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
import DomainManagement from "@/components/domains/domain-managament";
import { getDomainsQuery } from "@church-space/supabase/queries/all/get-domains";
import {
  SettingsSection,
  SettingsHeader,
  SettingsTitle,
  SettingsDescription,
  SettingsContent,
  SettingsRow,
  SettingsRowTitle,
  SettingsRowDescription,
  SettingsRowAction,
} from "@/components/settings/settings-settings";
import { Button } from "@church-space/ui/button";
import Link from "next/link";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@church-space/ui/select";

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

  const selectOptions = [
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
  ];

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-0">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Organization</SettingsTitle>
            <SettingsDescription>
              Manage your organization settings
            </SettingsDescription>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div className="flex items-center gap-2">
                <SettingsRowTitle>Organization Name</SettingsRowTitle>
              </div>
              <SettingsRowAction>
                {/* You can place your action elements here */}
                <Button>Configure</Button>
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Primary Email</SettingsRowTitle>
                <SettingsRowDescription>
                  Connected on 23/03/2025 by John Doe
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                {/* You can place your action elements here */}
                <Button>Configure</Button>
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Planning Center Connection</SettingsRowTitle>
                <SettingsRowDescription>
                  Connected on 23/03/2025 by John Doe
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                {/* You can place your action elements here */}
                <Button>Configure</Button>
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>
      </div>
    </>
  );
}
