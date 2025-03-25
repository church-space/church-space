import { Client } from "../../types";

export async function getPcoListsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("pco_lists")
    .select("*")
    .eq("organization_id", organizationId);

  return { data, error };
}
