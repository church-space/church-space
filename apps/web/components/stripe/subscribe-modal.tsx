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

// Map of subscription plan values to their Stripe price IDs
const PRICE_ID_MAP: Record<string, string> = {
  "250": "",
  "5000": "price_1R44BeJPD51CqUc4w3O6kphP",
  "10000": "price_1R44DFJPD51CqUc4t3YdSRig",
  "20000": "price_1R44GGJPD51CqUc4gzUUGwcF",
  "35000": "price_1R44GHJPD51CqUc4nx2vss1X",
  "50000": "price_1R44GJJPD51CqUc4waaNBK2W",
  "75000": "price_1R44GKJPD51CqUc4LmBi5azy",
  "100000": "price_1R44GMJPD51CqUc48dPj9tCw",
  "150000": "price_1R44HgJPD51CqUc4uhFo7Rlf",
  "200000": "price_1R44HfJPD51CqUc4yODcbAXh",
  "250000": "price_1R44O4JPD51CqUc4EV7y9zru",
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

  const handleSubscribe = async () => {
    if (!selectedPlan || !PRICE_ID_MAP[selectedPlan]) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: PRICE_ID_MAP[selectedPlan],
          organizationId,
          userId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
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
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={!selectedPlan || isLoading}
          >
            {isLoading ? "Processing..." : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
