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

export async function createEmailAutomationStep(
  supabase: Client,
  step: Database["public"]["Tables"]["email_automation_steps"]["Insert"]
) {
  const { data, error } = await supabase
    .from("email_automation_steps")
    .insert(step)
    .select();
  return { data, error };
}

export async function deleteEmailAutomationStep(
  supabase: Client,
  stepId: number
) {
  const { data, error } = await supabase
    .from("email_automation_steps")
    .delete()
    .eq("id", stepId)
    .select();
  return { data, error };
}

export async function updateEmailAutomationStep(
  supabase: Client,
  step: Database["public"]["Tables"]["email_automation_steps"]["Update"],
  stepId: number
) {
  const { data, error } = await supabase
    .from("email_automation_steps")
    .update(step)
    .eq("id", stepId)
    .select();
  return { data, error };
}

export async function cancelAutomationRuns(
  supabase: Client,
  automationId: number,
  triggerDevId: string,
  reason: string
) {
  const { data, error } = await supabase
    .from("email_automation_members")
    .update({ status: "cancelled", reason })
    .eq("automation_id", automationId)
    .eq("trigger_dev_id", triggerDevId)
    .select();

  return { data, error };
}
