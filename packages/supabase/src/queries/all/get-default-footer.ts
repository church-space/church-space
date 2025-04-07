import { Client } from "../../types";

export async function getDefaultFooterQuery(supabase: Client, orgId: string) {
  const { data: footer, error: footerError } = await supabase
    .from("email_org_default_footer_values")
    .select("*")
    .eq("organization_id", orgId)
    .maybeSingle();

  if (footerError) {
    throw footerError;
  }

  return {
    footer,
  };
}
