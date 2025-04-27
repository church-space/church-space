import { Client } from "../../types";

export async function getActiveAutomationMemberCount(
  supabase: Client,
  automationId: number
) {
  const { data: count, error: countError } = await supabase
    .from("email_automation_members")
    .select("*", { count: "exact" })
    .eq("automation_id", automationId)
    .eq("status", "active");

  if (countError) {
    throw countError;
  }

  return {
    count,
  };
}
