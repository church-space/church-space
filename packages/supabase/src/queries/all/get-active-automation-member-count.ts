import { Client } from "../../types";

export async function getActiveAutomationMemberCount(
  supabase: Client,
  automationId: number
) {
  const { data: count, error: countError } = await supabase
    .from("email_automation_members")
    .select("id", { count: "exact" })
    .eq("automation_id", automationId)
    .eq("status", "in-progress");

  if (countError) {
    throw countError;
  }

  return {
    count,
  };
}
