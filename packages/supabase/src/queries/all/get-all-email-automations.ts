import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  isActive?: boolean;
  searchTerm?: string;
}

export async function getEmailAutomationsCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("email_automations")
    .select(
      `
      id
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId);

  if (params?.isActive !== undefined) {
    query = query.eq("is_active", params.isActive);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `name.ilike.${searchTerm},description.ilike.${searchTerm}`
    );
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getAllEmailAutomations(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("email_automations")
    .select(
      `
      id,
      created_at,
      name,
      trigger_type,
      notify_admin,
      wait,
      email_details,
      email_template_id,
      list_id,
      description,
      is_active,
      from_email_domain,
      updated_at
    `
    )
    .order("name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.isActive !== undefined) {
    query = query.eq("is_active", params.isActive);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `name.ilike.${searchTerm},description.ilike.${searchTerm}`
    );
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  return { data, error };
}
