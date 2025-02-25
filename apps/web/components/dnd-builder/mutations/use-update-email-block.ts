import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";
import type { BlockData, BlockType } from "@/types/blocks";

interface UpdateEmailBlockParams {
  blockId: number;
  type?: BlockType;
  value?: BlockData;
  order?: number;
  linkedFile?: string | null;
}

export function useUpdateEmailBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      blockId,
      type,
      value,
      order,
      linkedFile,
    }: UpdateEmailBlockParams) => {
      // Prepare the update data
      const updateData: any = {};

      if (type !== undefined) {
        updateData.type = type;
      }

      if (value !== undefined) {
        updateData.value = value;
      }

      if (order !== undefined) {
        updateData.order = order;
      }

      if (linkedFile !== undefined) {
        updateData.linked_file = linkedFile;
      }

      try {
        const { data, error } = await supabase
          .from("email_blocks")
          .update(updateData)
          .eq("id", blockId)
          .select()
          .single();

        if (error) {
          console.error("Error updating email block:", error);
          console.error("Failed update details:", { blockId, updateData });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Exception updating email block:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the email query to refetch the data
      if (data && data.email_id) {
        queryClient.invalidateQueries({ queryKey: ["email", data.email_id] });
      }
    },
  });
}
