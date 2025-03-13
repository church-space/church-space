import { useQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

export function useCourseWithBlocks(courseId: number | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }

      // Get the email data with specific fields
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          `
          id,
          title,
          organization_id
        `,
        )
        .eq("id", courseId)
        .single();

      if (courseError) {
        throw courseError;
      }

      // Get the blocks with proper ordering
      const { data: blocksData, error: blocksError } = await supabase
        .from("course_blocks")
        .select("*")
        .eq("course_id", courseId)
        .order("order", { ascending: true });

      if (blocksError) {
        throw blocksError;
      }

      return {
        course: courseData,
        blocks: blocksData || [],
      };
    },
    enabled: !!courseId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
