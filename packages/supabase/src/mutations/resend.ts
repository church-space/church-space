import type { Client, Database } from "../types";

export async function upsertEmailRecipient(
  supabase: Client,
  {
    resend_email_id,
    status,
  }: {
    resend_email_id: string;
    status: Database["public"]["Enums"]["email_delivery_status"];
  }
) {
  return supabase.from("email_recipients").upsert(
    {
      resend_email_id,
      status,
    },
    { onConflict: "resend_email_id" }
  );
}

export async function insertEmailLinkClicked(
  supabase: Client,
  {
    resend_email_id,
    link_clicked,
  }: {
    resend_email_id: string;
    link_clicked: string;
  }
) {
  return supabase.from("email_link_clicks").insert({
    resend_email_id,
    link_clicked,
  });
}
