import CourseDndProvider from "@/components/dnd-builder/course-dnd-provider";
import EmailNotFound from "@/components/not-found/email";
import { createClient } from "@church-space/supabase/server";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { cookies } from "next/headers";

type Params = Promise<{ courseId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const courseId = parseInt(params.courseId, 10);

  // Get organizationId from cookies
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  const queryClient = new QueryClient();

  // Prefetch the course data
  await queryClient.prefetchQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const supabase = await createClient();

      // Get the course data with specific fields
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
        shouldRedirect: false,
      };
    },
  });

  // Get the prefetched data to check for early returns
  const courseData = queryClient.getQueryData(["course", courseId]) as any;

  // Early return if course not found or organization ID doesn't match
  if (
    !courseData?.course ||
    courseData.course.organization_id !== organizationId
  ) {
    return <EmailNotFound />;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseDndProvider organizationId={organizationId || ""} />
    </HydrationBoundary>
  );
}
