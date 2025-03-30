import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  status?: ("active" | "inactive")[];
  searchTerm?: string;
}

export async function getQrLinksCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("qr_links")
    .select(
      `
      id
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId);

  if (params?.status && params.status.length > 0) {
    query = query.in("status", params.status);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(`name.ilike.${searchTerm},url.ilike.${searchTerm}`);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getAllQrLinks(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("qr_links")
    .select(
      `
      id,
      created_at,
      organization_id,
      url,
      name,
      status
    `
    )
    .order("name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.status && params.status.length > 0) {
    query = query.in("status", params.status);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(`name.ilike.${searchTerm},url.ilike.${searchTerm}`);
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  return { data, error };
}
