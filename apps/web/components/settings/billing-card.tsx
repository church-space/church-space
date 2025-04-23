"use client";

import { Badge } from "@church-space/ui/badge";
import { Card, CardContent } from "@church-space/ui/card";
import { cn } from "@church-space/ui/cn";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  MailIcon,
} from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

export default function SubscriptionCard({
  subscription,
}: {
  subscription: any | undefined;
}) {
  if (!subscription || !subscription.stripe_prices?.stripe_products) {
    return null;
  }

  const emailsSent = subscription.email_usage?.sends_used ?? 0;
  const emailLimit = subscription.stripe_prices.stripe_products.send_limit;
  const emailsRemaining = emailLimit - emailsSent;

  const chartData = [
    {
      name: "Emails Used",
      value: emailsSent,
      fill: "hsl(var(--primary))",
    },
    {
      name: "Emails Remaining",
      value: emailsRemaining,
      fill: "hsl(var(--muted))",
    },
  ];

  return (
    <div
      className={`mb-4 grid max-w-5xl grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2`}
    >
      <Card className="mx-auto w-full">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Subscription</h2>
              <Badge variant="success" className="px-3 py-1 text-sm capitalize">
                <CheckCircle2Icon className="mr-1.5 h-4 w-4" />
                Active
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {subscription.stripe_prices.stripe_products.name}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              Next Bill
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

          <div
            className={cn("mb-0", subscription.cancel_at_period_end && "mb-4")}
          >
            <div className="flex items-center text-sm text-muted-foreground">
              <CreditCardIcon className="mr-1.5 h-3.5 w-3.5" />
              Payment Method
            </div>
            <p className="text-lg font-medium capitalize">
              {subscription.payment_method_brand} ••••{" "}
              {subscription.payment_method_last4}
            </p>
          </div>
          {subscription.cancel_at_period_end && (
            <div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
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
          )}
        </CardContent>
      </Card>
      <Card className="mx-auto w-full">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            <div className="relative flex h-[200px] w-[200px] items-start justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {Math.round((emailsSent / emailLimit) * 100)}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Used
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </div>
            <div className="mt-4 w-full text-center">
              <div className="mb-1 flex w-full flex-col items-center justify-center">
                <div className="mb-1 flex w-full items-center justify-center text-muted-foreground">
                  <MailIcon className="mr-2 h-4 w-4" />
                  Email Sending Limit
                </div>
                <p className="text-lg font-medium">
                  {emailsSent.toLocaleString()} / {emailLimit.toLocaleString()}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {emailsRemaining.toLocaleString()} emails remaining this billing
                cycle
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
