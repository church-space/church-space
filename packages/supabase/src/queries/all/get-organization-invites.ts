import { Client } from "../../types";

export async function getAllOrganizationInvites(
  supabase: Client,
  organizationId: string
) {
  let query = supabase
    .from("invites")
    .select(
      `
      id,
      email,
      expires,
      status
    `
    )
    .order("created_at", { ascending: true })
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  const { data, error } = await query;

  return { data, error };
}
