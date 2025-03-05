import { Client } from "../../types";

export async function getEmailsQuery(supabase: Client, organizationId: string) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("type", "standard")
    .order("created_at", { ascending: false })
    .eq("organization_id", organizationId);

  return { data, error };
}
