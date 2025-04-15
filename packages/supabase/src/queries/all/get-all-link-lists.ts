import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  isPublic?: boolean;
  searchTerm?: string;
}

export async function getAllLinkLists(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("link_lists")
    .select(
      `
      id,
      created_at,
      private_name,
      is_public,
      url_slug
    `
    )
    .order("created_at", { ascending: false })
    .order("private_name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.isPublic !== undefined) {
    query = query.eq("is_public", params.isPublic);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `private_name.ilike.${searchTerm},url_slug.ilike.${searchTerm}`
    );
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;

  return { data, error };
}
