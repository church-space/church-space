import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  isPublic?: boolean;
  searchTerm?: string;
}

export async function getAllEmailCategories(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("pco_list_categories")
    .select(
      `
      id,
      created_at,
      pco_name,
      pco_id,
      is_public,
      description
    `
    )
    .order("is_public", { ascending: false })
    .order("pco_name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.isPublic !== undefined) {
    query = query.eq("is_public", params.isPublic);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `pco_name.ilike.${searchTerm},description.ilike.${searchTerm}`
    );
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;

  return { data, error };
}
