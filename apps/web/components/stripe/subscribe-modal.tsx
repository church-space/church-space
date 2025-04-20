"use client";

import React, { useState } from "react";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@church-space/ui/dialog";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@church-space/ui/select";
import { Label } from "@church-space/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";

interface StripePlans {
  productId: string;
  priceId: string;
  price: number;
  sendLimit: number;
  enviorment: "testing" | "live";
}

const STRIPE_PLANS: StripePlans[] = [
  {
    productId: "prod_Ry0AINZpor4sJ3",
    priceId: "price_1R44AbJPD51CqUc4YgnAQmia",
    price: 8,
    sendLimit: 5000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0D0QpnB7zNfO",
    priceId: "price_1R44D4JPD51CqUc45uoKQS77",
    price: 16,
    sendLimit: 10000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0EMgnmn9yzxB",
    priceId: "price_1R44DlJPD51CqUc49Ty6MIfz",
    price: 32,
    sendLimit: 20000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0E46a7LnSdnp",
    priceId: "price_1RFlO4JPD51CqUc41nUQizDK",
    price: 48,
    sendLimit: 30000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5gwIHqyWktAd",
    priceId: "price_1RFlV0JPD51CqUc42nzlT0N3",
    price: 64,
    sendLimit: 40000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0FtAuo7d83fN",
    priceId: "price_1R44F6JPD51CqUc42OqLfKh4",
    price: 80,
    sendLimit: 50000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fimnn0jaI8x",
    priceId: "price_1RFlUUJPD51CqUc4Qr2jgzZA",
    price: 96,
    sendLimit: 60000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GpfPkf6tmuo",
    priceId: "price_1RFlOqJPD51CqUc4Go9flhn5",
    price: 112,
    sendLimit: 70000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fPv9RJhg6Xb",
    priceId: "price_1RFlToJPD51CqUc438x89eps",
    price: 128,
    sendLimit: 80000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5edTouwc2jnm",
    priceId: "price_1RFlSvJPD51CqUc4LHtCkaNq",
    price: 144,
    sendLimit: 90000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GuwNyFWV7VZ",
    priceId: "price_1R44G1JPD51CqUc4IOxGpopu",
    price: 160,
    sendLimit: 100000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5dWZN1EplTHY",
    priceId: "price_1RFlSRJPD51CqUc4zcX1X2ZE",
    price: 200,
    sendLimit: 125000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0HasrAP8MNmG",
    priceId: "price_1R44GsJPD51CqUc4h9KMvw4j",
    price: 240,
    sendLimit: 150000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0CJ8eQeoXnXR",
    priceId: "price_1R44BeJPD51CqUc4w3O6kphP",
    price: 8,
    sendLimit: 5000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0DuepmPHWG8b",
    priceId: "price_1R44DFJPD51CqUc4t3YdSRig",
    price: 16,
    sendLimit: 10000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0Ge0OavXMDQV",
    priceId: "price_1R44GGJPD51CqUc4gzUUGwcF",
    price: 32,
    sendLimit: 20000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GqqHFHHwqAb",
    priceId: "price_1RFlQqJPD51CqUc4ouPd8G5Z",
    price: 48,
    sendLimit: 30000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5r59Tp5IYo6V",
    priceId: "price_1RFlfyJPD51CqUc4g71GQk9q",
    price: 64,
    sendLimit: 40000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GvuSloCxCMF",
    priceId: "price_1R44GJJPD51CqUc4waaNBK2W",
    price: 80,
    sendLimit: 50000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5s8f3R9F3AmA",
    priceId: "price_1RFlgGJPD51CqUc4szZH4sOU",
    price: 96,
    sendLimit: 60000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GTiTk5sNAIS",
    priceId: "price_1RFlR8JPD51CqUc4IdxGPSYE",
    price: 112,
    sendLimit: 70000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5sROshbuf4BN",
    priceId: "price_1RFlgbJPD51CqUc4Skl3Hcd7",
    price: 128,
    sendLimit: 80000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5tSs45lOWBwr",
    priceId: "price_1RFli6JPD51CqUc4TVUEdAsI",
    price: 144,
    sendLimit: 90000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0G0Bo4FvAExH",
    priceId: "price_1R44GMJPD51CqUc48dPj9tCw",
    price: 160,
    sendLimit: 100000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5teVw5OvKGWw",
    priceId: "price_1RFlhMJPD51CqUc42Ne6ohwv",
    price: 200,
    sendLimit: 125000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0IPcegN3koXN",
    priceId: "price_1R44HgJPD51CqUc4uhFo7Rlf",
    price: 240,
    sendLimit: 150000,
    enviorment: "live",
  },
];

// Function to get price ID based on send limit and environment
const getPriceId = (
  sendLimit: string,
  environment: "testing" | "live",
): string => {
  const plan = STRIPE_PLANS.find(
    (plan) =>
      plan.sendLimit.toString() === sendLimit &&
      plan.enviorment === environment,
  );
  return plan?.priceId || "";
};

export default function SubscribeModal({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError("Please select a valid plan");
      return;
    }

    const environment = process.env.NEXT_PUBLIC_STRIPE_ENV as
      | "testing"
      | "live";
    const priceId = getPriceId(selectedPlan, environment);

    if (!priceId) {
      setError("Invalid plan selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          organizationId,
          userId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(`Error: ${data.error}`);
        setIsLoading(false);
      } else {
        setError(
          "No checkout URL returned. Please try again or contact support.",
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Subscribe</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe</DialogTitle>
          <DialogDescription>Choose a plan to subscribe to</DialogDescription>
        </DialogHeader>
        <Label>How many emails do you need to send per month?</Label>
        <Select onValueChange={setSelectedPlan} value={selectedPlan}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {STRIPE_PLANS.filter(
              (plan) => plan.enviorment === process.env.NEXT_PUBLIC_STRIPE_ENV,
            ).map((plan) => (
              <SelectItem key={plan.priceId} value={plan.sendLimit.toString()}>
                {plan.sendLimit.toLocaleString()} emails - ${plan.price}/month
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        <Card className="flex flex-col gap-2">
          <CardHeader>
            <CardTitle>
              <h3 className="text-xl font-semibold">
                $
                {
                  STRIPE_PLANS.find(
                    (plan) => plan.sendLimit.toString() === selectedPlan,
                  )?.price
                }
                /month
              </h3>
            </CardTitle>
            <CardDescription>
              Send up to <b>20,000 emails</b> per month to an <b>unlimited</b>{" "}
              number of contacts.
            </CardDescription>
          </CardHeader>
        </Card>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={!selectedPlan || isLoading}
          >
            {isLoading
              ? "Processing..."
              : `Subscribe for $${
                  STRIPE_PLANS.find(
                    (plan) => plan.sendLimit.toString() === selectedPlan,
                  )?.price
                }/month`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
