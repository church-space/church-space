"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Eye } from "lucide-react";

import { cancelScheduledEmail } from "@/actions/cancel-schedule-email";
import { createClient } from "@church-space/supabase/client";
import { getPcoListQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { getDomainQuery } from "@church-space/supabase/queries/all/get-domains";

export default function ScheduledPage({ email: initialEmail }: { email: any }) {
  const [email] = useState<typeof initialEmail>(initialEmail);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");

  const supabase = createClient();

  // Initialize state from email data
  const [subject] = useState(email.subject || "");
  const [listId] = useState(email.list_id || "");

  // From details
  const [fromEmail] = useState(email.from_email || "");
  const [fromDomain, setFromDomain] = useState(
    email.from_email_domain?.toString() || "",
  );
  const [fromName, setFromName] = useState(email.from_name || "");
  const [replyToEmail, setReplyToEmail] = useState(email.reply_to || "");
  const [replyToDomain, setReplyToDomain] = useState(
    email.reply_to_domain?.toString() || "",
  );

  // Fetch list and domain data
  const { data: listData } = useQuery({
    queryKey: ["pcoList", listId],
    queryFn: () => getPcoListQuery(supabase, parseInt(listId || "0")),
    enabled: !!listId,
  });

  const { data: domainData } = useQuery({
    queryKey: ["domain", fromDomain],
    queryFn: () => getDomainQuery(supabase, parseInt(fromDomain || "0")),
    enabled: !!fromDomain,
  });

  const { data: replyToDomainData } = useQuery({
    queryKey: ["domain", replyToDomain],
    queryFn: () => getDomainQuery(supabase, parseInt(replyToDomain || "0")),
    enabled: !!replyToDomain,
  });

  // Schedule details
  const [sendDate, setSendDate] = useState<Date | null>(
    email.scheduled_for ? new Date(email.scheduled_for) : null,
  );

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/email">Email</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  {email.subject || "Untitled Email"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4"></div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5">
        {subject ? (
          <div className="text-2xl font-bold">{subject}</div>
        ) : (
          <div className="text-2xl font-bold text-muted-foreground">
            Subject
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => cancelScheduledEmail({ emailId: email.id })}
          >
            Cancel Schedule
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              To: {listData?.data?.[0]?.pco_list_description}{" "}
              <span className="text-muted-foreground">
                ({listData?.data?.[0]?.pco_total_people}{" "}
                {listData?.data?.[0]?.pco_total_people === "1"
                  ? "person"
                  : "people"}
                )
              </span>
              <span className="text-muted-foreground">
                {listData?.data?.[0]?.pco_list_categories?.pco_name}
              </span>
            </p>
            <p>
              From: {fromName}{" "}
              <span className="text-muted-foreground">
                {fromEmail}
                {fromDomain ? `@${domainData?.data?.[0]?.domain}` : ""}
              </span>
            </p>
            <p>
              Reply-To: {replyToEmail}
              <span className="text-muted-foreground">
                {replyToDomain
                  ? `@${replyToDomainData?.data?.[0]?.domain}`
                  : ""}
              </span>
            </p>
            <p>Subject: {subject}</p>
            <p>Scheduled For: {sendDate?.toLocaleString()}</p>
            <Dialog
              open={previewOpen === "true"}
              onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewOpen("true");
                  }}
                >
                  <span className="hidden md:block">Preview</span>
                  <span className="block md:hidden">
                    <Eye />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[95%] min-w-[95%] p-4">
                <DialogHeader className="sr-only">
                  <DialogTitle>Preview</DialogTitle>
                </DialogHeader>

                <EmailPreview />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
