import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";

interface DeleteEmailBlockParams {
  blockId: number;
}

export function useDeleteEmailBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ blockId }: DeleteEmailBlockParams) => {
      const { data, error } = await supabase
        .from("email_blocks")
        .delete()
        .eq("id", blockId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate the email query to refetch the data
      // We need to get the emailId from the returned data
      if (data && data.email_id) {
        queryClient.invalidateQueries({ queryKey: ["email", data.email_id] });
      }
    },
  });
}
