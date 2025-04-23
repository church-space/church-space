"use server";

import type { ActionResponse } from "@/types/action";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";
import stripe from "@/lib/stripe";

export interface PortalSessionResponse {
  url: string;
}

export const createPortalSessionAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      return_url: z.string(),
    }),
  )
  .metadata({
    name: "create-portal-session",
  })
  .action(
    async (parsedInput): Promise<ActionResponse<PortalSessionResponse>> => {
      try {
        const supabase = await createClient();

        // Get the stripe customer ID for this organization
        const { data: customerData, error: customerError } = await supabase
          .from("stripe_customers")
          .select("stripe_customer_id")
          .eq("organization_id", parsedInput.parsedInput.organization_id)
          .single();

        if (customerError || !customerData?.stripe_customer_id) {
          return {
            success: false,
            error: "No Stripe customer found for this organization",
          };
        }

        // Create the portal session
        try {
          const session = await stripe.billingPortal.sessions.create({
            customer: customerData.stripe_customer_id,
            return_url: parsedInput.parsedInput.return_url,
          });

          if (!session?.url) {
            console.error("Missing URL in session response");
            return {
              success: false,
              error: "Invalid portal session response from Stripe",
            };
          }

          return {
            success: true,
            data: {
              url: session.url,
            },
          };
        } catch (stripeError) {
          console.error("Stripe portal session error:", stripeError);
          return {
            success: false,
            error:
              stripeError instanceof Error
                ? stripeError.message
                : "Stripe portal session creation failed",
          };
        }
      } catch (error) {
        console.error("Error creating portal session:", error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        } else {
          console.error("Non-Error object thrown:", error);
        }

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : typeof error === "object" && error !== null
                ? JSON.stringify(error)
                : "Failed to create portal session",
        };
      }
    },
  );
