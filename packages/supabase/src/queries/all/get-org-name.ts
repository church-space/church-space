import { Client } from "../../types";

export async function getOrgNameQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single();

  return { data, error };
}
