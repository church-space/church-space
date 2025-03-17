import { Client } from "../../types";

export async function getDomainsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return { data, error };
}
