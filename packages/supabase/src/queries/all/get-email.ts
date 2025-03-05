import { Client } from "../../types";

export async function getEmailQuery(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  return { data, error };
}
