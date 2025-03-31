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
    priceId: "price_1R44ELJPD51CqUc4ZEAQ8VFv",
    price: 56,
    sendLimit: 35000,
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
    productId: "prod_Ry0GpfPkf6tmuo",
    priceId: "price_1R44FbJPD51CqUc4M59ODEr0",
    price: 120,
    sendLimit: 75000,
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
    productId: "prod_Ry0HasrAP8MNmG",
    priceId: "price_1R44GsJPD51CqUc4h9KMvw4j",
    price: 240,
    sendLimit: 150000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0IhftKEGPcFx",
    priceId: "price_1R44HbJPD51CqUc4ugrIwgyk",
    price: 320,
    sendLimit: 200000,
    enviorment: "testing",
  },
  {
    productId: "prod_Ry0I707Nvcpiqe",
    priceId: "price_1R44IMJPD51CqUc4IZJRIzyB",
    price: 400,
    sendLimit: 250000,
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
    priceId: "price_1R44GHJPD51CqUc4nx2vss1X",
    price: 56,
    sendLimit: 35000,
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
    productId: "prod_Ry0GTiTk5sNAIS",
    priceId: "price_1R44GKJPD51CqUc4LmBi5azy",
    price: 120,
    sendLimit: 75000,
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
    productId: "prod_Ry0IPcegN3koXN",
    priceId: "price_1R44HgJPD51CqUc4uhFo7Rlf",
    price: 240,
    sendLimit: 150000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0IVB2PVA3SAU",
    priceId: "price_1R44HfJPD51CqUc4yODcbAXh",
    price: 320,
    sendLimit: 200000,
    enviorment: "live",
  },
  {
    productId: "prod_Ry0OPhNqvvY37g",
    priceId: "price_1R44O4JPD51CqUc4EV7y9zru",
    price: 400,
    sendLimit: 250000,
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
      console.log("Requesting checkout session with:", {
        priceId,
        organizationId,
        userId,
      });

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

      // Log the raw response before parsing
      console.log("Raw response status:", response.status, response.statusText);

      const data = await response.json();

      console.log("Checkout response data:", data);

      if (data.url) {
        console.log("Redirecting to:", data.url);
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
            <SelectItem value="250">250</SelectItem>
            <SelectItem value="5000">5,000</SelectItem>
            <SelectItem value="10000">10,000</SelectItem>
            <SelectItem value="20000">20,000</SelectItem>
            <SelectItem value="35000">35,000</SelectItem>
            <SelectItem value="50000">50,000</SelectItem>
            <SelectItem value="75000">75,000</SelectItem>
            <SelectItem value="100000">100,000</SelectItem>
            <SelectItem value="150000">150,000</SelectItem>
            <SelectItem value="200000">200,000</SelectItem>
            <SelectItem value="250000">250,000</SelectItem>
          </SelectContent>
        </Select>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        <Card className="flex flex-col gap-2">
          <CardHeader>
            <CardTitle>
              <h3 className="text-xl font-semibold">$30/month usd</h3>
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
            {isLoading ? "Processing..." : "Subscribe for $30/month"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
