import type { Client, Database } from "../types";

export async function createEmailTemplate(
  supabase: Client,
  templateName: string,
  organizationId: string
) {
  const { data, error } = await supabase.from("emails").insert({
    subject: templateName,
    type: "template",
    organization_id: organizationId,
  });
}
