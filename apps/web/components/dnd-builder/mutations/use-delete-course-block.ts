import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface DeleteCourseBlockParams {
  blockId: number;
}

export function useDeleteCourseBlock() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ blockId }: DeleteCourseBlockParams) => {
      try {
        const { data, error } = await supabase
          .from("course_blocks")
          .delete()
          .eq("id", blockId)
          .select()
          .single();

        if (error) {
          console.error("Error deleting course block:", error);
          console.error("Failed deletion details:", { blockId });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Exception deleting course block:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the email query to refetch the data
      // We need to get the emailId from the returned data
      if (data && data.course_id) {
        queryClient.invalidateQueries({ queryKey: ["course", data.course_id] });
      }
    },
  });
}
