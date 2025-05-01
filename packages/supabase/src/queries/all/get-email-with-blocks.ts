import { Client } from "../../types";

export async function getEmailWithBlocksQuery(
  supabase: Client,
  emailId: number,
  organizationId: string
) {
  // Get the email data with specific fields
  const { data: emailData, error: emailError } = await supabase
    .from("emails")
    .select(
      `
          id,
          subject,
          status,
          style,
          organization_id,
          type
        `
    )
    .eq("id", emailId)
    .eq("organization_id", organizationId)
    .single();

  if (emailError) {
    throw emailError;
  }

  // Get the blocks with proper ordering
  const { data: blocksData, error: blocksError } = await supabase
    .from("email_blocks")
    .select("*")
    .eq("email_id", emailId)
    .order("order", { ascending: true });

  if (blocksError) {
    throw blocksError;
  }

  // Fetch footer data
  const { data: footerData, error: footerError } = await supabase
    .from("email_footers")
    .select("*")
    .eq("email_id", emailId)
    .maybeSingle();

  if (footerError && footerError.code !== "PGRST116") {
    throw footerError;
  }

  return {
    email: emailData,
    blocks: blocksData || [],
    footer: footerData,
  };
}
