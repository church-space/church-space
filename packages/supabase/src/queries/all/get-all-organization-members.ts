import { Client } from "../../types";

export async function getAllOrganizationMembers(
  supabase: Client,
  organizationId: string
) {
  let query = supabase
    .from("organization_memberships")
    .select(
      `
      id,
      created_at,
      user_id,
      organization_id,
      role,
      users!inner (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .order("created_at", { ascending: true })
    .eq("organization_id", organizationId);

  const { data, error } = await query;

  return { data, error };
}
