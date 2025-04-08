import { Client } from "../../types";

export type EmailDeliveryStatus =
  | "sent"
  | "delivered"
  | "bounced"
  | "opened"
  | "delivery_delayed"
  | "complained"
  | "pending"
  | "did-not-send"
  | null;

export interface QueryParams {
  start?: number;
  end?: number;
  emailAddress?: string;
  recipientStatus?: EmailDeliveryStatus;
}

export async function getEmailRecipientsCount(
  supabase: Client,
  emailId: number,
  params?: QueryParams
) {
  let query = supabase
    .from("email_recipients")
    .select("*, people_emails!left(person:people(first_name, last_name))", {
      count: "exact",
      head: true,
    })
    .eq("email_id", emailId);

  if (params?.emailAddress) {
    const emailSearch = `%${params.emailAddress}%`;
    query = query.ilike("email_address", emailSearch);
  }

  if (params?.recipientStatus) {
    query = query.eq("status", params.recipientStatus);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getEmailRecipientsQuery(
  supabase: Client,
  emailId: number,
  params?: QueryParams
) {
  let query = supabase
    .from("email_recipients")
    .select(
      `
      id,
      email_address,
      status,
      created_at,
      updated_at,
      person:people_emails!left(
        email,
        person:people(
          first_name,
          last_name
        )
      )
    `
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .eq("email_id", emailId);

  if (params?.emailAddress) {
    const emailSearch = `%${params.emailAddress}%`;
    query = query.ilike("email_address", emailSearch);
  }

  if (params?.recipientStatus) {
    query = query.eq("status", params.recipientStatus);
  }

  // Apply pagination if provided
  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;
  return { data, error };
}
