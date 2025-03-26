"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";

import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import PreSendPage from "./pre-send-page";
import PostSendPage from "./post-send-page";
import SendingPage from "./sending-page";
import { redirect } from "next/navigation";
import TempSendNowButton from "./temp-send-now-button";
import SendTestEmail from "@/components/dnd-builder/send-test-email";
import { getEmailQuery } from "@church-space/supabase/queries/all/get-email";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import { useParams } from "next/navigation";

type Params = Promise<{ emailId: string }>;

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
      <header className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage>{email.data.subject}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          {email.data.status === "draft" ||
            (email.data.status === "scheduled" && <SendTestEmail />)}
          <TempSendNowButton />
        </div>
      </header>
      {email.data.status === "sending" && <SendingPage />}
      {email.data.status === "sent" && <PostSendPage />}
      {(email.data.status === "draft" || email.data.status === "scheduled") && (
        <PreSendPage email={email.data} />
      )}
    </>
  );
}
