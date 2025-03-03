import DndProvider from "@/components/dnd-builder/dnd-provider";
import { createClient } from "@church-space/supabase/server";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import EmailNotFound from "@/components/not-found/email";
import { redirect } from "next/navigation";

type Params = Promise<{ emailId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const emailId = parseInt(params.emailId, 10);

  const queryClient = new QueryClient();

  // Prefetch the email data
  await queryClient.prefetchQuery({
    queryKey: ["email", emailId],
    queryFn: async () => {
      const supabase = await createClient();

      // Get the email data with specific fields
      const { data: emailData, error: emailError } = await supabase
        .from("emails")
        .select(
          `
          id,
          subject,
          status,
          bg_color,
          blocks_bg_color,
          default_text_color,
          default_font,
          is_inset,
          organization_id,
          type, 
          is_rounded,
          link_color
        `
        )
        .eq("id", emailId)
        .single();

      if (emailError) {
        throw emailError;
      }

      // Early return if email status is sent or sending, or if type is template
      if (
        (emailData?.status && ["sent", "sending"].includes(emailData.status)) ||
        emailData?.type === "template"
      ) {
        return {
          email: emailData,
          blocks: [],
          footer: null,
          shouldRedirect: true,
        };
      }

      // Get the blocks with proper ordering
      const { data: blocksData, error: blocksError } = await supabase
        .from("email_blocks")
        .select("*")
        .eq("email_id", emailId)
        .order("order", { ascending: true });

      if (blocksError) {
        throw blocksError;
      }

      // Add footer data fetch
      const { data: footerData, error: footerError } = await supabase
        .from("email_footers")
        .select("*")
        .eq("email_id", emailId)
        .maybeSingle();

      // Only throw if it's not a "not found" error
      if (footerError && footerError.code !== "PGRST116") {
        throw footerError;
      }

      return {
        email: emailData,
        blocks: blocksData || [],
        footer: footerData,
        shouldRedirect: false,
      };
    },
  });

  // Get the prefetched data to check for early returns
  const emailData = queryClient.getQueryData(["email", emailId]) as any;

  // Early return if email not found
  if (!emailData?.email) {
    return <EmailNotFound />;
  }

  // Redirect if email status is sent/sending or type is template
  if (emailData.shouldRedirect) {
    redirect(`/emails/${emailId}/preview`);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DndProvider />
    </HydrationBoundary>
  );
}
