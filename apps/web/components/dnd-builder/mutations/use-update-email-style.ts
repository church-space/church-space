import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface UpdateEmailStyleParams {
  emailId: number;
  updates: {
    blocks_bg_color?: string;
    default_text_color?: string;
    default_font?: string;
    is_inset?: boolean;
    bg_color?: string;
    is_rounded?: boolean;
    link_color?: string;
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
      // Instead of invalidating the query which causes a refetch,
      // update the cached data directly
      queryClient.setQueryData(["email", variables.emailId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          email: {
            ...oldData.email,
            ...variables.updates,
          },
        };
      });
    },
  });
}
