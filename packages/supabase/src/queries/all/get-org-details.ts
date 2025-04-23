import { Client } from "../../types";

export async function getOrgDetailsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("name, default_email, default_email_domain, address")
    .eq("id", organizationId)
    .single();

  return { data, error };
}
