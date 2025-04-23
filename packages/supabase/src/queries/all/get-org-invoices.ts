import { Client } from "../../types";

export async function getOrgNameQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("stripe_payments")
    .select("*")
    .eq("organization_id", organizationId);

  return { data, error };
}
