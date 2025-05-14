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

export default function Page() {
  const params = useParams();
  const emailId = parseInt(params.emailId as string, 10);
  const supabase = createClient();
  const organizationId = Cookies.get("organizationId");

  if (!organizationId) {
    redirect("/emails");
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
    if (!email?.data) return; // No data to process

    if (emailState && emailState.id === email.data.id) {
      // We have existing local state and new data for the same email
      // Check if the local state is optimistically 'sending' or 'scheduled'
      // and if the fetched data status represents a "regression" (e.g., back to 'draft' or 'failed')
      if (
        (emailState.status === "sending" ||
          emailState.status === "scheduled") &&
        (email.data.status === "draft" || email.data.status === "failed")
      ) {
        // Optimistic state is "in progress", and fetched data's status is "older".
        // We should keep the optimistic status and merge other fields from the fresh fetch.
        setEmailState((prevState: any) => ({
          ...email.data, // Apply all fields from the newly fetched data
          status: prevState.status, // Crucially, override status with the optimistic one
        }));
      } else {
        // Fetched data is not a regression, or no optimistic state was in progress,
        // or fetched data matches/progresses the optimistic state (e.g., sending -> sent).
        // So, update emailState fully from the fetched data.
        setEmailState(email.data);
      }
    } else {
      // Initial load (emailState is null) or data for a different email ID.
      // Set emailState directly from fetched data.
      setEmailState(email.data);
    }
  }, [email?.data, emailState]); // emailState is a dependency because it's read in the effect

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
            // The updatedEmail object from PreSendPage already contains the new status
            // and is based on the email data PreSendPage was working with.
            // This will set emailState to the optimistic new state.
            setEmailState(updatedEmail);
          }}
          orgFooterDetails={orgFooterDetails}
        />
      );
    }
  };

  return <>{renderEmailPage()}</>;
}
