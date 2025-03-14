import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import type { BlockData, BlockType } from "@/types/blocks";

interface UpdateCourseBlockParams {
  blockId: number;
  type?: BlockType;
  value?: BlockData;
  order?: number;
  linkedFile?: string | null;
}

export function useUpdateCourseBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      blockId,
      type,
      value,
      order,
      linkedFile,
    }: UpdateCourseBlockParams) => {
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
          .from("course_blocks")
          .update(updateData)
          .eq("id", blockId)
          .select()
          .single();

        if (error) {
          console.error("Error updating course block:", error);
          console.error("Failed update details:", { blockId, updateData });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Exception updating course block:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Instead of invalidating the query, update the cache directly
      if (data && data.course_id) {
        queryClient.setQueryData(["course", data.course_id], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            blocks: oldData.blocks.map((block: any) =>
              block.id === data.id ? { ...block, ...data } : block,
            ),
          };
        });
      }
    },
  });
}
