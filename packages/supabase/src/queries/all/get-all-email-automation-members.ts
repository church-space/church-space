import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
}

export interface EmailAutomationMember {
  id: number;
  created_at: string;
  last_completed_step_id: number;
  automation_id: number;
  person_id: number;
  updated_at: string;
  status: string;
  reason: string | null;
  trigger_dev_id: string | null;
  person: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    nickname: string | null;
    pco_id: string;
  } | null;
  step: {
    id: number;
    type: string;
    values: any;
    order: number | null;
  } | null;
}

export interface EmailAutomationMemberParams {
  step?: number;
}

export async function getEmailAutomationMembersCount(
  supabase: Client,
  automationId: number,
  params?: EmailAutomationMemberParams
): Promise<{ count: number | null; error: any }> {
  let query = supabase
    .from("email_automation_members")
    .select("*", { count: "exact", head: true })
    .eq("automation_id", automationId);

  if (params?.step) {
    query = query.eq("step", params.step);
  }

  const { count, error } = await query;
  return { count, error };
}

export async function getEmailAutomationMembers(
  supabase: Client,
  automationId: number,
  params?: EmailAutomationMemberParams
): Promise<{ data: EmailAutomationMember[] | null; error: any }> {
  let query = supabase
    .from("email_automation_members")
    .select(
      `
      *,
      person:person_id(id, first_name, last_name, nickname, pco_id),
      step:last_completed_step_id(id, type, values, order)
    `
    )
    .eq("automation_id", automationId);

  if (params?.step) {
    query = query.eq("step", params.step);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  return { data: data as EmailAutomationMember[], error };
}
