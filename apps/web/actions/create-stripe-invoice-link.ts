"use server";

import type { ActionResponse } from "@/types/action";
import { z } from "zod";
import { authActionClient } from "./safe-action";
import stripe from "@/lib/stripe";

export const createStripeInvoiceLink = authActionClient
  .schema(
    z.object({
      invoiceId: z.string(),
    }),
  )
  .metadata({
    name: "create-stripe-invoice-link",
  })
  .action(async (parsedInput): Promise<ActionResponse<string>> => {
    try {
      const { invoiceId } = parsedInput.parsedInput;

      // Retrieve the invoice from Stripe
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (!invoice.hosted_invoice_url) {
        return {
          success: false,
          error: "No hosted invoice URL available for this invoice",
        };
      }

      return {
        success: true,
        data: invoice.hosted_invoice_url,
      };
    } catch (error) {
      console.error("Error retrieving invoice URL:", error);
      return {
        success: false,
        error: "Failed to retrieve invoice URL",
      };
    }
  });
