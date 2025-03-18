import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session ID" },
        { status: 400 },
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 400 },
      );
    }

    // Get customer ID and metadata
    const customerId = session.customer;
    const { organizationId, userId } = session.metadata || {};

    if (!customerId || !organizationId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing customer or organization data" },
        { status: 400 },
      );
    }

    // Get subscription information
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId as string,
      limit: 1,
      status: "all",
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { success: false, error: "No subscription found" },
        { status: 400 },
      );
    }

    const subscription = subscriptions.data[0];

    // Initialize Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Store subscription in database
    await supabase.from("stripe_subscriptions").upsert(
      {
        organization_id: organizationId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify session" },
      { status: 500 },
    );
  }
}
