import { Client } from "../../types";

export async function getEmailBlocksQuery(supabase: Client, emailId: number) {
  // First, get the email data
  const { data: emailData, error: emailError } = await supabase
    .from("emails")
    .select("*")
    .eq("id", emailId)
    .single();

  if (emailError) {
    throw emailError;
  }

  // Then, get the blocks with proper ordering
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
