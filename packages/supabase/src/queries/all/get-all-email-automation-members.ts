import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
}

export async function getEmailAutomationsCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("email_automations")
    .select(
      `
      id
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId);

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getAllEmailAutomations(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("email_automations")
    .select(
      `
      id,
      created_at,
      name,
      trigger_type,
      pco_list_id,
      pco_form_id,
      notify_admin,
      wait,
      email_details,
      email_template_id,
      list_id,
      form_id,
      description,
      is_active
    `
    )
    .order("name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  return { data, error };
}

export interface EmailAutomationMember {
  id: number;
  created_at: string;
  step: string;
  automation_id: number;
  person_id: number;
}

export async function getEmailAutomationMembers(
  supabase: Client,
  automationId: number
): Promise<{ data: EmailAutomationMember[] | null; error: any }> {
  const { data, error } = await supabase
    .from("email_automation_step_members")
    .select("*")
    .eq("automation_id", automationId)
    .order("created_at", { ascending: true });

  return { data, error };
}
