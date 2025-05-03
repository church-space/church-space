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
  const { data, error } = await supabase.rpc("get_email_recipients_details", {
    email_id_input: emailId,
    email_search: params?.emailAddress ?? undefined,
    recipient_status: params?.recipientStatus ?? undefined,
    start_index: params?.start ?? 0,
    end_index: params?.end ?? 24,
  });

  return { data, error };
}
