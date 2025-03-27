"use client";

import { createClient } from "@church-space/supabase/client";
import { getEmailQuery } from "@church-space/supabase/queries/all/get-email";
import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import PostSendPage from "./post-send-page";
import PreSendPage from "./pre-send-page";
import SendingPage from "./sending-page";

export default function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);
  const supabase = createClient();

  const { data: email, isLoading } = useQuery({
    queryKey: ["email", emailId],
    queryFn: () => getEmailQuery(supabase, emailId),
  });

  if (!email || !email.data) {
    return <div>Email not found</div>;
  }

  if (email.data.type === "template") {
    redirect(`/emails/${emailId}/editor`);
  }

  return (
    <>
      {email.data.status === "sending" && (
        <SendingPage subject={email.data.subject} />
      )}
      {email.data.status === "sent" && <PostSendPage email={email.data} />}
      {(email.data.status === "draft" || email.data.status === "scheduled") && (
        <PreSendPage email={email.data} />
      )}
      {isLoading && <div>Loading...</div>}
    </>
  );
}
