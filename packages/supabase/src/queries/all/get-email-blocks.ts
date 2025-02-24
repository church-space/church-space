import { Client } from "../../types";

export async function getEmailBlocksQuery(supabase: Client, emailId: number) {
  const { data, error } = await supabase
    .from("emails")
    .select(
      `
      *,
      blocks:email_blocks(*)
    `
    )
    .eq("id", emailId)
    .order("blocks.order", { ascending: true })
    .single();

  if (error) {
    throw error;
  }

  return {
    email: {
      ...data,
      blocks: undefined, // Remove the blocks from the email object since we're returning it separately
    },
    blocks: data.blocks || [],
  };
}
