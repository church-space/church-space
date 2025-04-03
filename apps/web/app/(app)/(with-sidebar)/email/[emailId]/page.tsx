"use client";

import { createClient } from "@church-space/supabase/client";
import { getEmailQuery } from "@church-space/supabase/queries/all/get-email";
import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import PostSendPage from "./post-send-page";
import PreSendPage from "./pre-send-page";
import SendingPage from "./sending-page";
import ScheduledPage from "./scheduled-page";
import LoadingPage from "./loading-page";
import { cookies } from "next/headers";

export default async function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);
  const supabase = createClient();
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  const { data: email, isLoading } = useQuery({
    queryKey: ["email-id-page", emailId],
    queryFn: () => getEmailQuery(supabase, emailId),
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!email || !email.data) {
    return <div>Email not found</div>;
  }

  if (email.data.type === "template") {
    redirect(`/email/${emailId}/editor`);
  }

  if (email.data.organization_id !== organizationId) {
    redirect("/email");
  }

  return (
    <>
      {email.data.status === "sending" && (
        <SendingPage subject={email.data.subject} />
      )}
      {email.data.status === "sent" && <PostSendPage email={email.data} />}
      {(email.data.status === "draft" || email.data.status === "failed") && (
        <PreSendPage email={email.data} />
      )}
      {email.data.status === "scheduled" && (
        <ScheduledPage email={email.data} />
      )}
    </>
  );
}
