import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  role?: "owner" | "admin";
}

export async function getOrganizationMembersCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("organization_memberships")
    .select(
      `
      id,
      users!inner (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId);

  if (params?.role) {
    query = query.eq("role", params.role);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getAllOrganizationMembers(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
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

  if (params?.role) {
    query = query.eq("role", params.role);
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  return { data, error };
}
