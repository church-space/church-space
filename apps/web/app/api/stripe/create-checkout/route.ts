import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(5, "10s"),
  redis: RedisClient,
});

export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for");
    const { success } = await ratelimit.limit(`${ip}-stripe-checkout`);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { priceId, userId, organizationId } = await request.json();

    if (!userId || !organizationId || !priceId) {
      return NextResponse.json(
        { error: "User ID, Organization ID, and Price ID are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Check if customer already exists in Supabase
    const { data: existingCustomerData, error: customerQueryError } =
      await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .single();

    if (customerQueryError && customerQueryError.code !== "PGRST116") {
      console.error(
        "Error fetching customer from database:",
        customerQueryError,
      );
      return NextResponse.json(
        { error: "Error fetching customer data" },
        { status: 500 },
      );
    }

    let customerId = existingCustomerData?.stripe_customer_id;
    let stripeCustomerExists = false;

    // If we have a customer ID, verify it exists in Stripe
    if (customerId) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        stripeCustomerExists = !stripeCustomer.deleted;
      } catch (err) {
        // Customer not found in Stripe or other error

        stripeCustomerExists = false;
      }
    }

    // Create new customer if needed
    if (!customerId || !stripeCustomerExists) {
      // Create customer in Stripe

      const customer = await stripe.customers.create({
        metadata: {
          userId,
          organizationId,
        },
      });

      customerId = customer.id;

      // If we had a previous customer ID but it doesn't exist in Stripe,
      // update the record, otherwise create a new one
      if (existingCustomerData?.stripe_customer_id) {
        await supabase
          .from("stripe_customers")
          .update({
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        // Store the new customer in the database
        await supabase.from("stripe_customers").insert({
          user_id: userId,
          stripe_customer_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create checkout session with the customer ID
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: organizationId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/settings?canceled=true`,
      metadata: {
        organizationId,
        userId,
      },
    });

    if (!session.url) {
      console.error("Session created but no URL returned:", session);
      return NextResponse.json(
        { error: "No checkout URL returned from Stripe" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
