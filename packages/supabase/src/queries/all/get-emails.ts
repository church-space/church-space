import { Client } from "../../types";

export type EmailType = "standard" | "template";
export type EmailStatus =
  | "scheduled"
  | "sent"
  | "sending"
  | "draft"
  | "failed"
  | null;

export interface QueryParams {
  start?: number;
  end?: number;
  type?: EmailType[];
  searchTerm?: string;
  status?: EmailStatus;
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
      updated_at,
      status,
      sent_at,
      from_domain:from_email_domain(domain),
      reply_to_domain:reply_to_domain(domain),
      list:list_id(
        pco_list_description,
        pco_list_category:pco_list_category_id(
          pco_name,
          description
        )
      )
    `
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .eq("organization_id", organizationId);

  // Apply filters if provided
  if (params?.type && params.type.length > 0) {
    query = query.in("type", params.type);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.ilike("subject", searchTerm);
  }

  if (params?.status) {
    query = query.eq("status", params.status as any);
  }

  // Apply pagination if provided
  if (params?.start !== undefined && params?.end !== undefined) {
    // Request one extra item to determine if there's a next page
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;
  return { data, error };
}
