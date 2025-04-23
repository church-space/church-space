import { Client } from "../../types";

export async function getOrgInvoicesQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("stripe_payments")
    .select("*")
    .eq("organization_id", organizationId);

  return { data, error };
}
