"use client";

import { Button } from "@church-space/ui/button";
import { createStripeInvoiceLink } from "@/actions/create-stripe-invoice-link";
import { useState } from "react";

interface ViewInvoiceButtonProps {
  invoiceId: string;
}

export default function ViewInvoiceButton({
  invoiceId,
}: ViewInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const result = await createStripeInvoiceLink({
        invoiceId,
      });

      if (!result?.data?.success || !result?.data) {
        console.error("Failed to get invoice link:", result?.data?.error);
        return;
      }

      // Open the invoice URL in a new tab
      window.open(result.data?.data, "_blank");
    } catch (error) {
      console.error("Error viewing invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Loading..." : "View"}
    </Button>
  );
}
