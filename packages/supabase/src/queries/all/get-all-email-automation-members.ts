import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
}

export interface EmailAutomationMember {
  id: number;
  created_at: string;
  step: string;
  automation_id: number;
  person_id: number;
}

export interface EmailAutomationMemberParams {
  step?: string;
}

export async function getEmailAutomationMembersCount(
  supabase: Client,
  automationId: number,
  params?: EmailAutomationMemberParams
): Promise<{ count: number | null; error: any }> {
  let query = supabase
    .from("email_automation_step_members")
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
    .from("email_automation_step_members")
    .select("*")
    .eq("automation_id", automationId);

  if (params?.step) {
    query = query.eq("step", params.step);
  }

  query = query.order("created_at", { ascending: true });

  const { data, error } = await query;

  return { data, error };
}
