"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import PostSendPage from "./post-send-page";
import PreSendPage from "./pre-send-page";
import SendingPage from "./sending-page";
import ScheduledPage from "./scheduled-page";
import LoadingPage from "./loading-page";
import { useState, useEffect } from "react";
import { getEmailAction } from "@/actions/get-email";

export default function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);

  const [emailState, setEmailState] = useState<any>(null);

  const { data: email, isLoading } = useQuery({
    queryKey: ["email-id-page", emailId],
    queryFn: () => getEmailAction({ emailId }),
  });

  const currentEmail = emailState || email?.data;

  // Update emailState when email data changes
  useEffect(() => {
    if (email?.data?.data) {
      setEmailState(email.data.data);
    }
  }, [email?.data?.data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!currentEmail) {
    return <div>Email not found</div>;
  }

  if (currentEmail?.type === "template") {
    redirect(`/emails/${emailId}/editor`);
  }

  return (
    <>
      {currentEmail.status === "sending" && (
        <SendingPage subject={currentEmail.subject} />
      )}
      {currentEmail.status === "sent" && (
        <PostSendPage initialEmail={currentEmail} />
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
