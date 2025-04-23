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
import SubscribeModal from "@/components/stripe/subscribe-modal";
import { getOrgSubscriptionQuery } from "@church-space/supabase/queries/all/get-org-subscription";
import { createClient } from "@church-space/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

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

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
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
            <SettingsTitle>Billing</SettingsTitle>
            <SettingsDescription>
              Manage your billing information
            </SettingsDescription>
          </SettingsHeader>

          {subscriptionData && <BillingCard subscription={subscriptionData} />}
          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle>Current Plan</SettingsRowTitle>
                <SettingsRowDescription>
                  {subscriptionData?.stripe_prices?.amount ? (
                    <span>
                      ${subscriptionData.stripe_prices.amount}{" "}
                      {subscriptionData.stripe_prices.currency?.toUpperCase()}
                    </span>
                  ) : (
                    "Free"
                  )}
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <div className="flex w-full items-center gap-2 rounded-md border bg-card p-2 px-4 md:w-fit">
                  <div className="text-sm">
                    {subscriptionData?.stripe_prices?.stripe_products?.name
                      ? subscriptionData.stripe_prices.stripe_products.name
                      : "500 Emails Sends per Month"}
                  </div>
                </div>
              </SettingsRowAction>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Billing</SettingsRowTitle>
                <SettingsRowDescription>
                  Manage your billing information
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                {subscriptionData?.status === "active" ? (
                  process.env.NEXT_PUBLIC_STRIPE_ENV === "live" ? (
                    <Link href="https://billing.stripe.com/p/login/bIYg303LI4CAbRe288">
                      <Button>Manage Plan and Payment Method</Button>
                    </Link>
                  ) : (
                    <Link href="https://billing.stripe.com/p/login/test_28o4ic2eJ4zw8F2144">
                      <Button>Manage Plan and Payment Method</Button>
                    </Link>
                  )
                ) : (
                  <SubscribeModal
                    organizationId={organizationId}
                    userId={user.id}
                  />
                )}
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Recent Invoices</SettingsTitle>
          </SettingsHeader>

          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle>Jan 1st, 2025</SettingsRowTitle>
                <SettingsRowDescription>$100.00</SettingsRowDescription>
              </div>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Jan 1st, 2025</SettingsRowTitle>
                <SettingsRowDescription>$100.00</SettingsRowDescription>
              </div>
            </SettingsRow>
            <SettingsRow>
              <div>
                <SettingsRowTitle>Jan 1st, 2025</SettingsRowTitle>
                <SettingsRowDescription>$100.00</SettingsRowDescription>
              </div>
            </SettingsRow>
            <Link href="/settings/billing/invoices">
              <SettingsRow>
                <div>
                  <SettingsRowTitle>View All</SettingsRowTitle>
                </div>
                <SettingsRowAction>
                  <ChevronRightIcon className="h-4 w-4" />
                </SettingsRowAction>
              </SettingsRow>
            </Link>
          </SettingsContent>
        </SettingsSection>
      </div>
    </div>
  );
}
