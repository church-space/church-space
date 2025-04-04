import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  searchTerm?: string;
}

export async function getEmailTemplatesCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("emails")
    .select(
      `
      id
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId)
    .eq("type", "template");

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getAllEmailTemplates(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("emails")
    .select(
      `
      id,
      created_at,
      subject
    `
    )
    .order("created_at", { ascending: false })
    .eq("organization_id", organizationId)
    .eq("type", "template");

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  return { data, error };
}
