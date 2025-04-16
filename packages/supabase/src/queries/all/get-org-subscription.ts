import { Client } from "../../types";

export async function getOrgSubscriptionQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("stripe_subscriptions")
    .select(
      `id,
      organization_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      payment_method_brand,
      payment_method_last4,
      stripe_prices (
        amount,
        currency,
        stripe_product_id,
        stripe_products (
          name,
          send_limit
        )
      )`
    )
    .eq("organization_id", organizationId)
    .single();

  return { data, error };
}
