import { useQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

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

      // Fetch footer data - there's a unique constraint on email_id so we can use single()
      const { data: footerData, error: footerError } = await supabase
        .from("email_footers")
        .select("*")
        .eq("email_id", emailId)
        .maybeSingle();

      console.log("footerData", footerData);

      // Only throw if it's not a "not found" error
      if (footerError && footerError.code !== "PGRST116") {
        throw footerError;
      }

      return {
        email: emailData,
        blocks: blocksData || [],
        footer: footerData,
      };
    },
    enabled: !!emailId,
    staleTime: 0, // Don't use cached data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}
