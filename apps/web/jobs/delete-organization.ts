import "server-only";

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@church-space/supabase/job";
import Stripe from "stripe";
import { Resend } from "resend";

// DELETE FROM RESEND TOO
// DELETE ALL EMAIL AUTOMATION STEPS
// DELETE ALL WEBHOOKS IN PCO

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

export const deleteOrganization = task({
  id: "delete-organization",

  run: async (payload: { organization_id: string }, io) => {
    const supabase = createClient();

    // Step 1: Get the organization details
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, pco_org_id")
      .eq("id", payload.organization_id)
      .single();

    if (orgError) {
      throw new Error(`Error fetching organization: ${orgError.message}`);
    }

    // Step 2: Get and delete domains from Resend
    const { data: domains, error: domainsError } = await supabase
      .from("domains")
      .select("id, domain, resend_domain_id")
      .eq("organization_id", payload.organization_id);

    if (domainsError) {
      console.error("Error fetching domains:", domainsError);
    } else {
      // Delete each domain from Resend
      for (const domain of domains || []) {
        if (domain.resend_domain_id) {
          try {
            await resend.domains.remove(domain.resend_domain_id);
          } catch (error) {
            console.error(
              `Error deleting domain ${domain.domain} from Resend:`,
              error,
            );
          }
        }
      }
    }

    // Step 3: Delete all email automation steps
    const { data: automations, error: automationsError } = await supabase
      .from("email_automations")
      .select("id")
      .eq("organization_id", payload.organization_id);

    if (automationsError) {
      console.error("Error fetching automations:", automationsError);
    } else {
      // Delete automation steps for each automation
      for (const automation of automations || []) {
        const { error: deleteStepsError } = await supabase
          .from("email_automation_steps")
          .delete()
          .eq("automation_id", automation.id);

        if (deleteStepsError) {
          console.error(
            `Error deleting automation steps for automation ${automation.id}:`,
            deleteStepsError,
          );
        }
      }
    }

    // Step 4: Handle PCO webhooks deletion
    const { data: pcoConnection, error: pcoError } = await supabase
      .from("pco_connections")
      .select("access_token, refresh_token, last_refreshed")
      .eq("organization_id", payload.organization_id)
      .single();

    if (pcoError && pcoError.code !== "PGRST116") {
      console.error("Error fetching PCO connection:", pcoError);
    } else if (pcoConnection) {
      // Check if token needs refreshing
      let accessToken = pcoConnection.access_token;
      const lastRefreshed = new Date(pcoConnection.last_refreshed);
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      if (lastRefreshed < twoHoursAgo) {
        // Token needs refresh
        try {
          const response = await fetch(
            "https://api.planningcenteronline.com/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: process.env.PCO_CLIENT_ID!,
                client_secret: process.env.PCO_CLIENT_SECRET!,
                refresh_token: pcoConnection.refresh_token,
              }).toString(),
            },
          );

          const tokenData = await response.json();

          if (tokenData.access_token) {
            accessToken = tokenData.access_token;

            // Update the token in the database
            await supabase
              .from("pco_connections")
              .update({
                access_token: tokenData.access_token,
                refresh_token:
                  tokenData.refresh_token || pcoConnection.refresh_token,
                last_refreshed: new Date().toISOString(),
              })
              .eq("organization_id", payload.organization_id);
          }
        } catch (error) {
          console.error("Error refreshing PCO token:", error);
        }
      }

      // Get existing webhooks from PCO
      try {
        const webhooksResponse = await fetch(
          "https://api.planningcenteronline.com/webhooks/v2/subscriptions",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const webhooksData = await webhooksResponse.json();

        // Delete webhooks that match our URL pattern
        for (const webhook of webhooksData.data || []) {
          if (
            webhook.attributes.url.startsWith(
              "https://churchspace.co/api/pco/webhook/",
            )
          ) {
            await fetch(
              `https://api.planningcenteronline.com/webhooks/v2/subscriptions/${webhook.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );
          }
        }
      } catch (error) {
        console.error("Error handling PCO webhooks:", error);
      }
    }

    // Step 5: Delete from Stripe (payments, subscriptions, customer)
    const { data: stripeSubscription, error: subError } = await supabase
      .from("stripe_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("organization_id", payload.organization_id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching stripe subscription:", subError);
    }

    // Cancel subscription if it exists
    if (stripeSubscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(
          stripeSubscription.stripe_subscription_id,
        );
      } catch (error) {
        console.error("Error cancelling Stripe subscription:", error);
      }
    }

    // Delete payments associated with the organization
    const { data: payments, error: paymentsError } = await supabase
      .from("stripe_payments")
      .select("id")
      .eq("organization_id", payload.organization_id);

    if (paymentsError) {
      console.error("Error fetching stripe payments:", paymentsError);
    } else {
      for (const payment of payments || []) {
        const { error: deletePaymentError } = await supabase
          .from("stripe_payments")
          .delete()
          .eq("id", payment.id);

        if (deletePaymentError) {
          console.error(
            `Error deleting payment ${payment.id}:`,
            deletePaymentError,
          );
        }
      }
    }

    // Delete customer if it exists
    if (stripeSubscription?.stripe_customer_id) {
      try {
        await stripe.customers.del(stripeSubscription.stripe_customer_id);
      } catch (error) {
        console.error("Error deleting Stripe customer:", error);
      }
    }

    // Step 6: Delete organization assets from storage
    try {
      const { data: files } = await supabase.storage
        .from("organization-assets")
        .list(payload.organization_id);

      if (files && files.length > 0) {
        const filePaths = files.map(
          (file: { name: string }) => `${payload.organization_id}/${file.name}`,
        );

        await supabase.storage.from("organization-assets").remove(filePaths);
      }
    } catch (error) {
      console.error("Error handling organization assets deletion:", error);
    }

    // Step 7: Finally, delete the organization
    const { error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", payload.organization_id);

    if (deleteError) {
      throw new Error(`Failed to delete organization: ${deleteError.message}`);
    }

    return {
      success: true,
      message: `Organization ${organization.name} (${payload.organization_id}) successfully deleted`,
    };
  },
});
