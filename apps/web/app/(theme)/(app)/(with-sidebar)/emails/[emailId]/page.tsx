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
import { useState, useEffect } from "react";
import { getSentEmailStatsAction } from "@/actions/get-sent-email-stats";
import Cookies from "js-cookie";
import { getOrgFooterDetailsAction } from "@/actions/get-org-footer-details";
import EmailNotFound from "@/components/not-found/email";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emails",
};

export default function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);
  const supabase = createClient();
  const organizationId = Cookies.get("organizationId");

  if (!organizationId) {
    redirect("/onboarding");
  }

  const [emailState, setEmailState] = useState<any>(null);

  const { data: email, isLoading } = useQuery({
    queryKey: ["email-id-page", emailId],
    queryFn: () => getEmailQuery(supabase, emailId, organizationId),
  });

  const { data: sentStats } = useQuery({
    queryKey: ["sentEmailStats", emailId],
    queryFn: () => getSentEmailStatsAction({ emailId: emailId }),
    enabled: (emailState?.status || email?.data?.status) === "sent",
  });

  const { data: orgFooterDetails } = useQuery({
    queryKey: ["orgFooterDetails", organizationId],
    queryFn: () => getOrgFooterDetailsAction({ organizationId }),
  });

  // Update emailState when email data changes
  useEffect(() => {
    if (email?.data) {
      setEmailState(email.data);
    }
  }, [email?.data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!emailState && !email?.data) {
    return <EmailNotFound />;
  }

  if ((emailState || email?.data)?.type === "template") {
    redirect(`/emails/${emailId}/editor`);
  }

  const currentEmail = emailState || email?.data;

  // Determine which component to show based on the email status
  const renderEmailPage = () => {
    // Use the most up-to-date status
    const status = currentEmail.status;

    if (status === "sending") {
      return <SendingPage subject={currentEmail.subject} />;
    } else if (status === "sent") {
      return (
        <PostSendPage
          initialEmail={currentEmail}
          stats={sentStats}
          orgFooterDetails={orgFooterDetails}
        />
      );
    } else if (status === "scheduled") {
      return (
        <ScheduledPage
          email={currentEmail}
          orgFooterDetails={orgFooterDetails}
        />
      );
    } else {
      // "draft" or "failed"
      return (
        <PreSendPage
          email={currentEmail}
          onStatusChange={(
            newStatus: "sending" | "scheduled",
            updatedEmail?: any,
          ) => {
            // Merge the updated email with the current email to ensure all fields are preserved
            const updatedState = {
              ...currentEmail,
              ...updatedEmail,
              status: newStatus,
            };
            setEmailState(updatedState);
          }}
          orgFooterDetails={orgFooterDetails}
        />
      );
    }
  };

  return <>{renderEmailPage()}</>;
}
