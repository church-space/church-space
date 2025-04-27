import { Client } from "../../types";

export async function getEmailAutomationQuery(
  supabase: Client,
  automationId: number,
  organizationId: string
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
    .eq("organization_id", organizationId)
    .single();

  return { data, error };
}

export type TriggerType = "person_added" | "person_removed";

export async function getEmailAutomationsByPCOIdQuery(
  supabase: Client,
  pcoListId: string,
  organizationId: string,
  triggerType: TriggerType
) {
  const { data, error } = await supabase
    .from("email_automations")
    .select(`*, pco_list:pco_lists!inner(pco_list_id)`)
    .eq("pco_lists.pco_list_id", pcoListId)
    .eq("organization_id", organizationId)
    .eq("trigger_type", triggerType)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getEmailAutomationId(
  supabase: Client,
  automationId: number
) {
  const { data, error } = await supabase
    .from("email_automations")
    .select("id")
    .eq("id", automationId)
    .single();

  return { data, error };
}
