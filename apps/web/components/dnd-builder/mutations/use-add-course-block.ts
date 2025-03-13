import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import type { BlockData, BlockType } from "@/types/blocks";

interface AddCourseBlockParams {
  courseId: number;
  type: BlockType;
  value: BlockData;
  order: number;
  linkedFile?: string;
}

export function useAddCourseBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      type,
      value,
      order,
      linkedFile,
    }: AddCourseBlockParams) => {
      // Explicitly type the insert data
      const insertData: any = {
        course_id: courseId,
        type,
        value,
        order,
      };

      if (linkedFile) {
        insertData.linked_file = linkedFile;
      }

      const { data, error } = await supabase
        .from("course_blocks")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the course query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["course", variables.courseId],
      });
    },
  });
}
