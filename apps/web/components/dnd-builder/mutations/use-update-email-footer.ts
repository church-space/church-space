import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface UpdateEmailFooterParams {
  emailId: number;
  organizationId: string;
  updates: {
    name?: string;
    subtitle?: string;
    logo?: string;
    bg_color?: string;
    text_color?: string;
    secondary_text_color?: string;
    links?: any;
    socials_color?: string;
    socials_style?: "filled" | "outline" | "icon-only";
    socials_icon_color?: string;
  };
}

export function useUpdateEmailFooter() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      organizationId,
      updates,
    }: UpdateEmailFooterParams) => {
      if (!emailId) {
        throw new Error("Email ID is required");
      }

      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      // Check if a footer already exists for this email
      const { data: existingFooter, error: checkError } = await supabase
        .from("email_footers")
        .select("id")
        .eq("email_id", emailId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let result;

      if (existingFooter) {
        // Update existing footer
        const { data, error } = await supabase
          .from("email_footers")
          .update(updates)
          .eq("id", existingFooter.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      } else {
        // Create new footer
        const { data, error } = await supabase
          .from("email_footers")
          .insert({
            email_id: emailId,
            organization_id: organizationId,
            type: "standard", // Use "standard" instead of "email"
            ...updates,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate the email query to refetch the data (including footer)
      queryClient.invalidateQueries({
        queryKey: ["email", variables.emailId],
      });
    },
  });
}
