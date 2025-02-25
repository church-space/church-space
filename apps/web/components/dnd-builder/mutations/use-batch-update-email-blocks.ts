import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";

interface BlockUpdate {
  id: number;
  order: number;
}

interface BatchUpdateEmailBlocksParams {
  emailId: number;
  updates: BlockUpdate[];
}

export function useBatchUpdateEmailBlocks() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ emailId, updates }: BatchUpdateEmailBlocksParams) => {
      // Use Promise.all to run all updates in parallel
      const updatePromises = updates.map(({ id, order }) => {
        return supabase.from("email_blocks").update({ order }).eq("id", id);
      });

      const results = await Promise.all(updatePromises);

      // Check if any updates failed
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} blocks`);
      }

      return { success: true, emailId };
    },
    onSuccess: (data) => {
      // Invalidate the email query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["email", data.emailId] });
    },
  });
}
