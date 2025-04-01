import { Client } from "../../types";

export async function getOrgEmailLimit(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("org_email_usage")
    .select("sends_remaining, current_period_end")
    .eq("organization_id", organizationId)
    .single();

  return data;
}
