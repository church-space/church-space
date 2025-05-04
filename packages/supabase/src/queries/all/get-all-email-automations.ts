import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  isActive?: boolean;
  searchTerm?: string;
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
      list_id,
      description,
      is_active,
      updated_at, 
          list:list_id(
        pco_list_description
      )
    `
    )
    .order("updated_at", { ascending: false })
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
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;

  return { data, error };
}
