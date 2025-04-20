import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  searchTerm?: string;
}

export async function getAllEmailCategories(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("email_categories")
    .select(
      `
      id,
      created_at,
      name,
      organization_id,
      description, 
      updated_at
    `
    )
    .order("name", { ascending: true })
    .eq("organization_id", organizationId);

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
