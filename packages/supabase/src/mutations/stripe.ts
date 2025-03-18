import type { Client } from "../types";

// Customer mutations
export async function upsertCustomer(
  supabase: Client,
  {
    userId,
    stripeCustomerId,
    email,
  }: {
    userId: string;
    stripeCustomerId: string;
    email?: string;
  }
) {
  return supabase.from("stripe_customers").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

// Subscription mutations
export async function upsertSubscription(
  supabase: Client,
  {
    organizationId,
    stripeCustomerId,
    subscriptionId,
    priceId,
    status,
    periodStart,
    periodEnd,
    cancelAtPeriodEnd,
    paymentMethodBrand,
    paymentMethodLast4,
    trialStart,
    trialEnd,
  }: {
    organizationId: string;
    stripeCustomerId: string;
    subscriptionId: string;
    priceId: string;
    status: string;
    periodStart?: number;
    periodEnd?: number;
    cancelAtPeriodEnd?: boolean;
    paymentMethodBrand?: string;
    paymentMethodLast4?: string;
    trialStart?: number;
    trialEnd?: number;
  }
) {
  return supabase.from("stripe_subscriptions").upsert(
    {
      organization_id: organizationId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status,
      current_period_start: periodStart
        ? new Date(periodStart * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: cancelAtPeriodEnd,
      payment_method_brand: paymentMethodBrand,
      payment_method_last4: paymentMethodLast4,
      trial_start: trialStart
        ? new Date(trialStart * 1000).toISOString()
        : null,
      trial_end: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );
}

// Payment mutations
export async function upsertPayment(
  supabase: Client,
  {
    organizationId,
    stripeCustomerId,
    subscriptionId,
    paymentIntentId,
    invoiceId,
    priceId,
    amount,
    currency,
    status,
  }: {
    organizationId: string;
    stripeCustomerId: string;
    subscriptionId?: string;
    paymentIntentId: string;
    invoiceId?: string;
    priceId: string;
    amount: number;
    currency: string;
    status: string;
  }
) {
  return supabase.from("stripe_payments").upsert(
    {
      organization_id: organizationId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_invoice_id: invoiceId,
      stripe_price_id: priceId,
      amount,
      currency,
      status,
    },
    { onConflict: "stripe_payment_intent_id" }
  );
}
