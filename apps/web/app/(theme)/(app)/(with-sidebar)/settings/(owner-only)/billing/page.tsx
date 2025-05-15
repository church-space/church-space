import BillingCard from "@/components/settings/billing-card";
import {
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsRow,
  SettingsRowAction,
  SettingsRowDescription,
  SettingsRowTitle,
  SettingsSection,
  SettingsTitle,
} from "@/components/settings/settings-settings";
import { getOrgSubscriptionQuery } from "@church-space/supabase/queries/all/get-org-subscription";
import { getOrgInvoicesQuery } from "@church-space/supabase/queries/all/get-org-invoices";
import { createClient } from "@church-space/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import ViewInvoiceButton from "@/components/stripe/view-invoice-button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
};

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

  const { data: subscriptionData, error: subscriptionError } =
    await getOrgSubscriptionQuery(supabase, organizationId);

  const { data: invoicesData, error: invoicesError } =
    await getOrgInvoicesQuery(supabase, organizationId);

  if (subscriptionError) {
    console.error(subscriptionError);
  }

  if (invoicesError) {
    console.error(invoicesError);
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/settings" className="hidden md:block">
                <BreadcrumbItem>Settings</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Plan and Billing</SettingsTitle>
            <SettingsDescription>
              Manage your plan and billing information
            </SettingsDescription>
          </SettingsHeader>

          {subscriptionData && Object.keys(subscriptionData).length > 0 ? (
            <BillingCard
              userId={user.id}
              organizationId={organizationId}
              subscription={subscriptionData}
            />
          ) : (
            <div className="py-4">No active subscription found.</div>
          )}
        </SettingsSection>
        {invoicesData && invoicesData.length > 0 ? (
          <SettingsSection>
            <SettingsHeader>
              <SettingsTitle>Recent Invoices</SettingsTitle>
            </SettingsHeader>

            <SettingsContent>
              {invoicesData.map((invoice, index) => (
                <SettingsRow key={invoice.id} isFirstRow={index === 0}>
                  <div>
                    <SettingsRowTitle>
                      {new Date(invoice.created_at!).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </SettingsRowTitle>
                    <SettingsRowDescription>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: invoice.currency?.toUpperCase() || "USD",
                      }).format(invoice.amount! / 100)}
                    </SettingsRowDescription>
                  </div>
                  <SettingsRowAction>
                    <ViewInvoiceButton invoiceId={invoice.stripe_invoice_id!} />
                  </SettingsRowAction>
                </SettingsRow>
              ))}
            </SettingsContent>
          </SettingsSection>
        ) : null}
      </div>
    </div>
  );
}
