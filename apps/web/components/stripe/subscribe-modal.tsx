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
    priceId: "price_1RJxwZJPD51CqUc4CagzIwMK",
    price: 9,
    sendLimit: 5000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0D0QpnB7zNfO",
    priceId: "price_1RJxxgJPD51CqUc497rj5N6m",
    price: 18,
    sendLimit: 10000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0EMgnmn9yzxB",
    priceId: "price_1RJxyWJPD51CqUc4w6OOdOOt",
    price: 36,
    sendLimit: 20000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0E46a7LnSdnp",
    priceId: "price_1RFlO4JPD51CqUc41nUQizDK",
    price: 54,
    sendLimit: 30000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5gwIHqyWktAd",
    priceId: "price_1RFlV0JPD51CqUc42nzlT0N3",
    price: 72,
    sendLimit: 40000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0FtAuo7d83fN",
    priceId: "price_1RJyByJPD51CqUc49jqPYTyv",
    price: 90,
    sendLimit: 50000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fimnn0jaI8x",
    priceId: "price_1RFlUUJPD51CqUc4Qr2jgzZA",
    price: 108,
    sendLimit: 60000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GpfPkf6tmuo",
    priceId: "price_1RFlOqJPD51CqUc4Go9flhn5",
    price: 126,
    sendLimit: 70000,
    enviorment: "testing",
  },
  {
    productId: "prod_SA5fPv9RJhg6Xb",
    priceId: "price_1RFlToJPD51CqUc438x89eps",
    price: 144,
    sendLimit: 80000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0GuwNyFWV7VZ",
    priceId: "price_1RJyHRJPD51CqUc4n0u45yq4",
    price: 180,
    sendLimit: 100000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0CJ8eQeoXnXR",
    priceId: "price_1RJyJmJPD51CqUc45o6yUJNp",
    price: 9,
    sendLimit: 5000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0DuepmPHWG8b",
    priceId: "price_1RJyL9JPD51CqUc40iVKe34g",
    price: 18,
    sendLimit: 10000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0Ge0OavXMDQV",
    priceId: "price_1RJyN8JPD51CqUc4SJqQARNN",
    price: 36,
    sendLimit: 20000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GqqHFHHwqAb",
    priceId: "price_1RJyRuJPD51CqUc4i5XwAbUh",
    price: 54,
    sendLimit: 30000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5r59Tp5IYo6V",
    priceId: "price_1RJySzJPD51CqUc4XBy5SkNF",
    price: 72,
    sendLimit: 40000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GvuSloCxCMF",
    priceId: "price_1RJyUFJPD51CqUc4eplNB9nE",
    price: 90,
    sendLimit: 50000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5s8f3R9F3AmA",
    priceId: "price_1RJyV2JPD51CqUc4vXN8fv7j",
    price: 108,
    sendLimit: 60000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0GTiTk5sNAIS",
    priceId: "price_1RJyW9JPD51CqUc4NYOTWKoh",
    price: 126,
    sendLimit: 70000,
    enviorment: "live",
  },
  {
    productId: "prod_SA5sROshbuf4BN",
    priceId: "price_1RJyXLJPD51CqUc4Hn9QGmPA",
    price: 144,
    sendLimit: 80000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0G0Bo4FvAExH",
    priceId: "price_1RJyXoJPD51CqUc4cB3qK17M",
    price: 180,
    sendLimit: 100000,
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
  const [selectedPlan, setSelectedPlan] = useState<string>("5000");
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
        <Button className="w-full">Upgrade Plan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Plan</DialogTitle>
          <DialogDescription>Choose a plan to upgrade to</DialogDescription>
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
              Send up to <b>{Number(selectedPlan).toLocaleString()} emails</b>{" "}
              per month to an <b>unlimited</b> number of contacts.
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
