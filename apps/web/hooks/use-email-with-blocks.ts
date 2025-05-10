"use client";

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
          style,
          organization_id,
          type, 
          preview_text
        `,
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
    },
    enabled: !!emailId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
