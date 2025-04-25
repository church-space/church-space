import { Client } from "../../types";

export async function getOrgFooterDetailsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("name, address")
    .eq("id", organizationId)
    .single();

  return { data, error };
}
