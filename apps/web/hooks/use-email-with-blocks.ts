import { useQuery } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";

export function useEmailWithBlocks(emailId: number | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["email", emailId],
    queryFn: async () => {
      if (!emailId) {
        throw new Error("Email ID is required");
      }

      // Get the email data with specific fields
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select(
          `
          id,
          subject,
          status,
          blocks_bg_color,
          default_text_color,
          default_font,
          is_inset,
          bg_color,
          organization_id,
          type,
          footer_bg_color,
          footer_text_color,
          footer_font
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
    },
    enabled: !!emailId,
  });
}
