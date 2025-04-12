import { Client } from "../../types";

export async function getEmailAutomationQuery(
  supabase: Client,
  automationId: number
) {
  const { data, error } = await supabase
    .from("email_automations")
    .select(
      `
      *,
      steps:email_automation_steps(
        id,
        created_at,
        type,
        values,
        order,
        from_email_domain,
        email_template,
        updated_at
      )
    `
    )
    .eq("id", automationId)
    .single();

  return { data, error };
}
