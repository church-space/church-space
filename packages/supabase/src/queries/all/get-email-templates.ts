import { Client } from "../../types";

export interface QueryParams {
  searchTerm?: string;
}

export async function getEmailTemplatesQuery(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("emails")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("type", "template");

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  const { data, error } = await query;
  return { data, error };
}
