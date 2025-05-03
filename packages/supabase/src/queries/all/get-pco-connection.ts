import { Client } from "../../types";

export async function getPcoConnection(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("pco_connections")
    .select(
      `
      connected_by,
      created_at,
      last_refreshed,
      users(
        first_name,
        last_name
      )
    `
    )
    .eq("organization_id", organizationId)
    .single();

  return { data, error };
}
