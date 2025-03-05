import { Client } from "../../types";

export type EmailType = "standard" | "template";

export interface QueryParams {
  start?: number;
  end?: number;
  type?: EmailType[];
  searchTerm?: string;
}

export async function getEmailsCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("emails")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  // Apply filters if provided
  if (params?.type && params.type.length > 0) {
    query = query.in("type", params.type);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getEmailsQuery(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("emails")
    .select(
      `
      id,
      subject,
      type,
      created_at,
      organization_id,
      from_email,
      from_name,
      reply_to,
      scheduled_for,
      updated_at
    `
    )
    .order("created_at", { ascending: false })
    .eq("organization_id", organizationId);

  // Apply filters if provided
  if (params?.type && params.type.length > 0) {
    query = query.in("type", params.type);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  // Apply pagination if provided
  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;
  return { data, error };
}
