import type { Client, Database } from "../types";

export async function createEmailAutomation(
  supabase: Client,
  automation: Database["public"]["Tables"]["email_automations"]["Insert"]
) {
  const { data, error } = await supabase
    .from("email_automations")
    .insert(automation)
    .select();
  return { data, error };
}
