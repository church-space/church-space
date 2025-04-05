import { Client } from "../../types";

export async function getEmailQuery(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  return { data, error };
}

export async function getEmailBlockCountQuery(
  supabase: Client,
  emailId: number
) {
  const { data, error } = await supabase
    .from("email_blocks")
    .select("*")
    .eq("email_id", emailId);

  const count = data?.length;

  return { count, error };
}

export async function getEmailStatsQuery(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  return { data, error };
}
