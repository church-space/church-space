import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import {
  upsertCustomer,
  upsertSubscription,
  upsertPayment,
} from "@church-space/supabase/mutations/stripe";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// This ensures the raw body is available for signature verification
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// List of events we want to handle
const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

export async function POST(request: NextRequest) {
  console.log("Stripe webhook received");

  try {
    // Log all headers for debugging
    console.log(
      "Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    // Get the raw request body as a string
    const rawBody = await request.text();
    console.log("Raw body length:", rawBody.length);

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    console.log(
      "Webhook request received with signature:",
      signature.substring(0, 20) + "...",
    );

    let event: Stripe.Event;

    try {
      // Verify the event came from Stripe
      console.log("Attempting to verify Stripe signature");
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET_TESTING!,
      );
      console.log("Webhook signature verified successfully");
    } catch (err) {
      console.error(
        `Webhook signature verification failed: ${(err as Error).message}`,
      );
      // Log the first few characters of the raw body for debugging
      console.error("Raw body starts with:", rawBody.substring(0, 50) + "...");
      console.error(
        "Raw body ends with:",
        rawBody.substring(rawBody.length - 50) + "...",
      );
      return NextResponse.json(
        { error: `Webhook Error: ${(err as Error).message}` },
        { status: 400 },
      );
    }

    // Skip processing if the event isn't one we're tracking
    if (!allowedEvents.includes(event.type)) {
      return NextResponse.json({ received: true });
    }

    try {
      const supabase = await createClient();

      // Process the event
      await processEvent(event, supabase);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook: ${(error as Error).message}`);
      return NextResponse.json(
        { error: `Webhook processing error: ${(error as Error).message}` },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      `Error handling webhook request: ${(error as Error).message}`,
    );
    return NextResponse.json(
      { error: `Webhook handling error: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}

async function processEvent(event: Stripe.Event, supabase: any) {
  console.log(`Processing event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
        supabase,
      );
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.pending_update_applied":
    case "customer.subscription.pending_update_expired":
    case "customer.subscription.trial_will_end":
      await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
        supabase,
      );
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        supabase,
      );
      break;

    case "invoice.paid":
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase);
      break;

    case "invoice.payment_failed":
    case "invoice.payment_action_required":
    case "invoice.upcoming":
    case "invoice.marked_uncollectible":
      await handleInvoiceEvent(event.data.object as Stripe.Invoice, supabase);
      break;

    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      await handlePaymentIntentEvent(
        event.data.object as Stripe.PaymentIntent,
        supabase,
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any,
) {
  // Get the metadata from the session
  const { organizationId, userId } = session.metadata || {};
  const customerId = session.customer as string;

  console.log("Checkout session completed", {
    organizationId,
    userId,
    customerId,
  });

  if (!customerId) {
    console.error("No customer ID in checkout session");
    return;
  }

  // Retrieve customer to get full details including email
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  // Store customer data in database
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // Get the subscription from the session
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    // Fetch the subscription to get full details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "items.data.price"],
    });

    await handleSubscriptionUpdated(subscription, supabase);
  }

  // If this is a one-time payment, handle it
  if (session.payment_intent) {
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await handlePaymentIntentEvent(paymentIntent, supabase);
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any,
) {
  const customerId = subscription.customer as string;

  // Get the organization ID from the customer's metadata
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  const organizationId = customerData.metadata?.organizationId;
  const userId = customerData.metadata?.userId;

  if (!organizationId) {
    console.error("No organization ID in customer metadata", { customerId });
    return;
  }

  // Update customer in database if userId is present
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // Get subscription details
  const priceId = subscription.items.data[0]?.price.id;

  // Get payment method details if available
  let paymentMethodBrand, paymentMethodLast4;

  if (subscription.default_payment_method) {
    const paymentMethod =
      typeof subscription.default_payment_method === "string"
        ? await stripe.paymentMethods.retrieve(
            subscription.default_payment_method,
          )
        : subscription.default_payment_method;

    if (paymentMethod.card) {
      paymentMethodBrand = paymentMethod.card.brand;
      paymentMethodLast4 = paymentMethod.card.last4;
    }
  }

  // Update subscription in database
  await upsertSubscription(supabase, {
    organizationId,
    stripeCustomerId: customerId,
    subscriptionId: subscription.id,
    priceId: priceId!,
    status: subscription.status,
    periodStart: subscription.current_period_start,
    periodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethodBrand,
    paymentMethodLast4,
    trialStart: subscription.trial_start || undefined,
    trialEnd: subscription.trial_end || undefined,
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any,
) {
  const customerId = subscription.customer as string;

  // Get the organization ID from the customer's metadata
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  const organizationId = customerData.metadata?.organizationId;
  const userId = customerData.metadata?.userId;

  if (!organizationId) {
    console.error("No organization ID in customer metadata", { customerId });
    return;
  }

  // Update customer in database if userId is present
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // Get subscription details
  const priceId = subscription.items.data[0]?.price.id;

  // Update subscription in database with canceled status
  await upsertSubscription(supabase, {
    organizationId,
    stripeCustomerId: customerId,
    subscriptionId: subscription.id,
    priceId: priceId!,
    status: "canceled",
    periodStart: subscription.current_period_start,
    periodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;

  // Get the organization ID from the customer's metadata
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  const organizationId = customerData.metadata?.organizationId;
  const userId = customerData.metadata?.userId;

  if (!organizationId) {
    console.error("No organization ID in customer metadata", { customerId });
    return;
  }

  // Update customer in database if userId is present
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // Get the subscription associated with this invoice
  const subscriptionId = invoice.subscription as string;

  // Get the payment intent
  if (invoice.payment_intent) {
    const paymentIntentId =
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent.id;

    // Get pricing information
    const priceId = invoice.lines.data[0]?.price?.id;

    if (!priceId) {
      console.error("No price ID found in invoice", { invoiceId: invoice.id });
      return;
    }

    // Store the payment in the database
    await upsertPayment(supabase, {
      organizationId,
      stripeCustomerId: customerId,
      subscriptionId,
      paymentIntentId,
      invoiceId: invoice.id,
      priceId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "succeeded",
    });
  }
}

async function handleInvoiceEvent(invoice: Stripe.Invoice, supabase: any) {
  const customerId = invoice.customer as string;

  // Get the organization ID from the customer's metadata
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  const organizationId = customerData.metadata?.organizationId;
  const userId = customerData.metadata?.userId;

  if (!organizationId) {
    console.error("No organization ID in customer metadata", { customerId });
    return;
  }

  // Update customer in database if userId is present
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // If there's a subscription, update it
  if (invoice.subscription) {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdated(subscription, supabase);
  }

  // If there's a payment intent, handle it
  if (invoice.payment_intent) {
    const paymentIntentId =
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : invoice.payment_intent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await handlePaymentIntentEvent(paymentIntent, supabase);
  }
}

async function handlePaymentIntentEvent(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any,
) {
  const customerId = paymentIntent.customer as string;

  if (!customerId) {
    console.error("No customer ID in payment intent", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  // Get the organization ID from the customer's metadata
  const customerData = await stripe.customers.retrieve(customerId);

  if (customerData.deleted) {
    console.error("Customer has been deleted in Stripe");
    return;
  }

  const organizationId = customerData.metadata?.organizationId;
  const userId = customerData.metadata?.userId;

  if (!organizationId) {
    console.error("No organization ID in customer metadata", { customerId });
    return;
  }

  // Update customer in database if userId is present
  if (userId) {
    await upsertCustomer(supabase, {
      userId,
      stripeCustomerId: customerId,
      email: customerData.email || undefined,
    });
  }

  // Get the invoice if it exists
  let invoiceId: string | undefined;
  let priceId: string | undefined;
  let subscriptionId: string | undefined;

  if (paymentIntent.invoice) {
    invoiceId =
      typeof paymentIntent.invoice === "string"
        ? paymentIntent.invoice
        : paymentIntent.invoice.id;

    // Fetch the invoice to get price and subscription data
    const invoice = await stripe.invoices.retrieve(invoiceId);
    priceId = invoice.lines.data[0]?.price?.id;
    subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;
  } else {
    // Try to get the price ID from metadata or product data
    priceId = paymentIntent.metadata?.priceId;
  }

  if (!priceId) {
    console.error("No price ID found for payment", {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  // Store the payment in the database
  await upsertPayment(supabase, {
    organizationId,
    stripeCustomerId: customerId,
    subscriptionId,
    paymentIntentId: paymentIntent.id,
    invoiceId,
    priceId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  });
}
