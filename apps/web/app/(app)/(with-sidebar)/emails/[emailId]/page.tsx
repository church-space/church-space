"use client";

import { createClient } from "@church-space/supabase/client";
import {
  getEmailQuery,
  getEmailStatsQuery,
} from "@church-space/supabase/queries/all/get-email";
import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import PostSendPage from "./post-send-page";
import PreSendPage from "./pre-send-page";
import SendingPage from "./sending-page";
import ScheduledPage from "./scheduled-page";
import LoadingPage from "./loading-page";
import { useState, useEffect } from "react";
import { getSentEmailStatsAction } from "@/actions/get-sent-email-stats";

export default function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);
  const supabase = createClient();

  const [emailState, setEmailState] = useState<any>(null);

  const { data: email, isLoading } = useQuery({
    queryKey: ["email-id-page", emailId],
    queryFn: () => getEmailQuery(supabase, emailId),
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["email-stats", emailId],
    queryFn: () => getEmailStatsQuery(supabase, emailId),
    enabled: (emailState?.status || email?.data?.status) === "sent",
  });

  const { data: sentStats } = useQuery({
    queryKey: ["sentEmailStats", emailId],
    queryFn: () => getSentEmailStatsAction({ emailId: emailId }),
    enabled: (emailState?.status || email?.data?.status) === "sent",
  });

  // Update emailState when email data changes
  useEffect(() => {
    if (email?.data) {
      setEmailState(email.data);
    }
  }, [email?.data]);

  if (
    isLoading ||
    ((emailState?.status || email?.data?.status) === "sent" && isStatsLoading)
  ) {
    return <LoadingPage />;
  }

  if (!emailState && !email?.data) {
    return <div>Email not found</div>;
  }

  if ((emailState || email?.data)?.type === "template") {
    redirect(`/emails/${emailId}/editor`);
  }

  const currentEmail = emailState || email?.data;

  return (
    <>
      {currentEmail.status === "sending" && (
        <SendingPage subject={currentEmail.subject} />
      )}
      {currentEmail.status === "sent" && (
        <PostSendPage initialEmail={currentEmail} stats={sentStats} />
      )}
      {(currentEmail.status === "draft" ||
        currentEmail.status === "failed") && (
        <PreSendPage
          email={currentEmail}
          onStatusChange={(newStatus) => {
            setEmailState((prev: any) => ({
              ...prev,
              status: newStatus,
            }));
          }}
        />
      )}
      {currentEmail.status === "scheduled" && (
        <ScheduledPage email={currentEmail} />
      )}
    </>
  );
}
