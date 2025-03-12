import { Client } from "../../types";

export async function getEmailWithFooterAndBlocksQuery(
  supabase: Client,
  emailId: number
) {
  console.log("Querying email with footer and blocks for email ID:", emailId);

  // First get the email
  const { data: emailData, error: emailError } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  if (emailError) {
    console.error("Error fetching email:", emailError);
    return { data: null, error: emailError };
  }

  if (!emailData) {
    console.error("Email not found");
    return { data: null, error: new Error("Email not found") };
  }

  // Get the blocks
  const { data: blocks, error: blocksError } = await supabase
    .from("email_blocks")
    .select("*")
    .eq("email_id", emailId);

  if (blocksError) {
    console.error("Error fetching blocks:", blocksError);
  }

  // Get the footer
  const { data: footer, error: footerError } = await supabase
    .from("email_footers")
    .select("*")
    .eq("email_id", emailId)
    .maybeSingle();

  if (footerError) {
    console.error("Error fetching footer:", footerError);
  }

  // Combine the data
  const result = {
    ...emailData,
    email_blocks: blocks || [],
    email_footers: footer ? [footer] : [],
  };

  console.log("Query result:", {
    hasEmail: !!emailData,
    hasBlocks: blocks && blocks.length > 0,
    hasFooter: !!footer,
  });

  return { data: result, error: null };
}
