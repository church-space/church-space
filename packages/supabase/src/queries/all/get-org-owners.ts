import { Client } from "../../types";

export async function getOrgOwnersQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("role", "owner");

  return { data, error };
}
