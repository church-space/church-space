// import "server-only";
// import { task } from "@trigger.dev/sdk/v3";
// import { createClient } from "@church-space/supabase/job";
// import Stripe from "stripe";

// DELETE FROM RESEND TOO
// DELETE ALL EMAIL AUTOMATION STEPS
// DELETE ALL WEBHOOKS IN PCO

// // Initialize Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-02-24.acacia",
// });

// export const deleteOrganization = task({
//   id: "delete-organization",

//   run: async (payload: { organization_id: string }, io) => {
//     const supabase = createClient();

//     // First, get the Stripe subscription for this organization
//     const { data: stripeSubscription, error: subscriptionError } =
//       await supabase
//         .from("stripe_subscriptions")
//         .select("stripe_subscription_id, stripe_customer_id, status")
//         .eq("organization_id", payload.organization_id)
//         .single();

//     if (subscriptionError) {
//       console.error("Error fetching stripe subscription:", subscriptionError);
//     }

//     // If there's an active subscription, cancel it in Stripe
//     if (
//       stripeSubscription?.stripe_subscription_id &&
//       stripeSubscription.status === "active"
//     ) {
//       try {
//         await stripe.subscriptions.cancel(
//           stripeSubscription.stripe_subscription_id,
//         );
//       } catch (error) {
//         console.error("Error cancelling Stripe subscription:", error);
//       }
//     }

//     // Delete the organization from the database
//     const { error: deleteError } = await supabase
//       .from("organizations")
//       .delete()
//       .eq("id", payload.organization_id);

//     if (deleteError) {
//       throw new Error(`Failed to delete organization: ${deleteError.message}`);
//     }

//     return { success: true };
//   },
// });
