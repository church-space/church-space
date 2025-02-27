import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface DeleteEmailBlockParams {
  blockId: number;
}

export function useDeleteEmailBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ blockId }: DeleteEmailBlockParams) => {
      try {
        const { data, error } = await supabase
          .from("email_blocks")
          .delete()
          .eq("id", blockId)
          .select()
          .single();

        if (error) {
          console.error("Error deleting email block:", error);
          console.error("Failed deletion details:", { blockId });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Exception deleting email block:", error);
        throw error;
      }
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
