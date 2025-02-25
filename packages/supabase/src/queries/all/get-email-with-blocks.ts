import { Client } from "../../types";

export async function getEmailWithBlocksQuery(
  supabase: Client,
  emailId: number
) {
  // Get the email data with specific fields
  const { data: emailData, error: emailError } = await supabase
    .from("emails")
    .select(
      `
      id,
      subject,
      status,
      bg_color,
      blocks_bg_color,
      default_text_color,
      default_font,
      is_inset,
      organization_id,
      type
    `
    )
    .eq("id", emailId)
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

  return {
    email: emailData,
    blocks: blocksData || [],
  };
}
