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

// This would typically come from an API
const subscriptionData = {
  id: 18,
  organization_id: "43d2f23f-82a8-4eca-b6de-174ca0f9a1a0",
  status: "active",
  current_period_start: "2025-04-01T22:29:14+00:00",
  current_period_end: "2025-05-01T22:29:14+00:00",
  cancel_at_period_end: false,
  payment_method_brand: "visa",
  payment_method_last4: "4242",
  stripe_prices: {
    amount: 16,
    currency: "usd",
    stripe_products: {
      name: "20,000 Email Sends per Month",
      send_limit: 20000,
    },
    stripe_product_id: "prod_Ry0EMgnmn9yzxB",
  },
};

export default function SubscriptionCard() {
  const emailsSent = 14783;
  const emailLimit = subscriptionData.stripe_prices.stripe_products.send_limit;
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
              {subscriptionData.stripe_prices.stripe_products.name}
            </p>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Next Billing Date
              </div>
              <p className="text-lg font-medium">
                {format(
                  new Date(subscriptionData.current_period_end),
                  "MMMM d, yyyy",
                )}{" "}
                - ${subscriptionData.stripe_prices.amount}/
                {subscriptionData.stripe_prices.currency.toUpperCase()}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Payment Method
              </div>
              <p className="text-lg font-medium capitalize">
                {subscriptionData.payment_method_brand} ••••{" "}
                {subscriptionData.payment_method_last4}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Cancel Date
              </div>
              <p className="text-lg font-medium">
                {subscriptionData.cancel_at_period_end
                  ? format(
                      new Date(subscriptionData.current_period_end),
                      "MMMM d, yyyy",
                    )
                  : "Not scheduled"}
              </p>
            </div>
          </div>

          <div>
            <div className="mt-6 flex flex-col items-center">
              <div className="relative flex h-[200px] w-[200px] items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">74%</span>
                </div>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    className="text-black"
                  />
                </svg>
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
