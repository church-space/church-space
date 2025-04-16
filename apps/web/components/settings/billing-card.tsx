"use client";
import {
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  MailIcon,
} from "lucide-react";
import { Card, CardContent } from "@church-space/ui/card";
import { Badge } from "@church-space/ui/badge";
import { format } from "date-fns";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@church-space/ui/chart";

export default function SubscriptionCard({
  subscription,
}: {
  subscription: any;
}) {
  const emailsSent = subscription.email_usage.sends_used;
  const emailLimit = subscription.stripe_prices.stripe_products.send_limit;
  const emailsRemaining = emailLimit - emailsSent;

  return (
    <Card className="mx-auto w-full max-w-5xl">
      <CardContent className="p-8">
        <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12`}>
          <div className="space-y-6">
            <div className="mb-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold">Subscription</h2>
              <Badge variant="success" className="px-3 py-1 text-sm capitalize">
                <CheckCircle2Icon className="mr-1.5 h-4 w-4" />
                Active
              </Badge>
            </div>
            <p className="mb-6 text-muted-foreground">
              {subscription.stripe_prices.stripe_products.name}
            </p>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Next Billing Date
              </div>
              <p className="text-lg font-medium">
                {format(
                  new Date(subscription.current_period_end),
                  "MMMM d, yyyy",
                )}{" "}
                - ${subscription.stripe_prices.amount}/
                {subscription.stripe_prices.currency.toUpperCase()}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Payment Method
              </div>
              <p className="text-lg font-medium capitalize">
                {subscription.payment_method_brand} ••••{" "}
                {subscription.payment_method_last4}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Cancel Date
              </div>
              <p className="text-lg font-medium">
                {subscription.cancel_at_period_end
                  ? format(
                      new Date(subscription.current_period_end),
                      "MMMM d, yyyy",
                    )
                  : "Not scheduled"}
              </p>
            </div>
          </div>

          <div>
            <div className="mt-6 flex flex-col items-center">
              <div className="relative flex h-[200px] w-[200px] items-center justify-center">
                <RadialBarChart
                  width={200}
                  height={200}
                  innerRadius="80%"
                  outerRadius="90%"
                  barSize={20}
                  data={[
                    {
                      name: "Emails Used",
                      value: (emailsSent / emailLimit) * 100,
                      fill: "currentColor",
                    },
                  ]}
                  startAngle={180}
                  endAngle={-180}
                  cx="50%"
                  cy="50%"
                >
                  <RadialBar
                    dataKey="value"
                    className="text-black"
                    background={{ fill: "#0000000D" }}
                  />
                </RadialBarChart>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">
                    {Math.round((emailsSent / emailLimit) * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-4 w-full text-center">
                <div className="mb-1 flex w-full flex-col items-center justify-center">
                  <div className="mb-1 flex w-full items-center justify-center text-muted-foreground">
                    <MailIcon className="mr-2 h-4 w-4" />
                    Email Sending Limit
                  </div>
                  <p className="text-lg font-medium">
                    {emailsSent.toLocaleString()} /{" "}
                    {emailLimit.toLocaleString()}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  {emailsRemaining.toLocaleString()} emails remaining this
                  billing cycle
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
