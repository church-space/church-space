import { Client } from "../../types";

export async function getEmailAutomationQuery(
  supabase: Client,
  automationId: number
) {
  const { data, error } = await supabase
    .from("email_automations")
    .select("*")
    .eq("id", automationId)
    .single();

  return { data, error };
}
