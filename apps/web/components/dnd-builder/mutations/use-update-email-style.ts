import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";

interface UpdateEmailStyleParams {
  emailId: number;
  updates: {
    bg_color?: string;
    footer_bg_color?: string;
    footer_font?: string;
    footer_text_color?: string;
  };
}

export function useUpdateEmailStyle() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ emailId, updates }: UpdateEmailStyleParams) => {
      const { data, error } = await supabase
        .from("emails")
        .update(updates)
        .eq("id", emailId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the email query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["email", variables.emailId] });
    },
  });
}
