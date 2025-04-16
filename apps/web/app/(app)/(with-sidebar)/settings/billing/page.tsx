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
import { createClient } from "@church-space/supabase/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@church-space/ui/select";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import Link from "next/link";
import { getOrgSubscriptionQuery } from "@church-space/supabase/queries/all/get-org-subscription";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";

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

  if (subscriptionError) {
    return <div>Error fetching subscription</div>;
  }

  const subscription = subscriptionData;

  console.log(subscription);

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
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-sm">
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
      <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Billing</SettingsTitle>
            <SettingsDescription>
              Manage your billing information
            </SettingsDescription>
          </SettingsHeader>

          {subscription && (
            <Card className="rounded-md p-4">
              <CardHeader>
                <CardTitle>Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Show current plan limit, price, payment method, next billing
                  date, and cancel at period end if there is one.
                </p>
              </CardContent>
            </Card>
          )}
          <SettingsContent>
            <SettingsRow isFirstRow>
              <div>
                <SettingsRowTitle>Plan</SettingsRowTitle>
                <SettingsRowDescription>
                  Change your plan
                </SettingsRowDescription>
              </div>
              <SettingsRowAction>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Link href="https://billing.stripe.com/p/login/test_28o4ic2eJ4zw8F2144">
                  <Button>Change Plan/Manage Payment Method</Button>
                </Link>
              </SettingsRowAction>
            </SettingsRow>
          </SettingsContent>
        </SettingsSection>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-0">
          <SubscribeModal organizationId={organizationId} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
