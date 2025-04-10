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

export async function deleteEmailAutomation(
  supabase: Client,
  automationId: number
) {
  const { data, error } = await supabase
    .from("email_automations")
    .delete()
    .eq("id", automationId)
    .select();

  return { data, error };
}

export async function updateEmailAutomation(
  supabase: Client,
  automation: Database["public"]["Tables"]["email_automations"]["Update"]
) {
  if (!automation.id) {
    throw new Error("Automation ID is required");
  }

  const { data, error } = await supabase
    .from("email_automations")
    .update(automation)
    .eq("id", automation.id)
    .select();
  return { data, error };
}
