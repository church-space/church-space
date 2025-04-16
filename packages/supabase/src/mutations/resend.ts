import type { Client, Database } from "../types";

export async function upsertEmailRecipient(
  supabase: Client,
  {
    resend_email_id,
    status,
    email_id,
    people_email_id,
    email_address,
    automation_id,
  }: {
    resend_email_id: string;
    status: Database["public"]["Enums"]["email_delivery_status"];
    email_id?: number;
    people_email_id: number;
    email_address: string;
    automation_id?: number;
  }
) {
  return supabase.from("email_recipients").upsert(
    {
      resend_email_id,
      status,
      email_id,
      people_email_id,
      email_address,
      automation_id,
    },
    { onConflict: "resend_email_id" }
  );
}

export async function insertEmailLinkClicked(
  supabase: Client,
  {
    resend_email_id,
    link_clicked,
    email_id,
  }: {
    resend_email_id: string;
    link_clicked: string;
    email_id: number;
  }
) {
  return supabase.from("email_link_clicks").insert({
    resend_email_id,
    link_clicked,
    email_id,
  });
}

export async function updatePeopleEmailStatus(
  supabase: Client,
  {
    people_email_id,
    status,
    reason,
  }: {
    people_email_id: number;
    status: Database["public"]["Enums"]["email_address_status"];
    reason: string;
  }
) {
  return supabase
    .from("people_emails")
    .update({ status, reason })
    .eq("id", people_email_id);
}

export async function updateDomainVerificationStatus(
  supabase: Client,
  {
    resend_domain_id,
    is_verified,
    dns_records,
  }: {
    resend_domain_id: string;
    is_verified: boolean;
    dns_records: any[];
  }
) {
  return supabase
    .from("domains")
    .update({ dns_records, is_verified })
    .eq("resend_domain_id", resend_domain_id);
}
