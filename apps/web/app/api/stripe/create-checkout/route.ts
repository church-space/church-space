import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  try {
    // Get request data
    const { priceId, organizationId, userId } = await req.json();

    if (!priceId || !organizationId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check if customer already exists
    const { data: customerData } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = customerData?.stripe_customer_id;

    // If no customer exists, create one
    if (!customerId) {
      // Get user email
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      const email = userData?.email;

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          organizationId,
        },
      });

      customerId = customer.id;

      // Store customer in database
      await supabase.from("stripe_customers").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      metadata: {
        organizationId,
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
