"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import { Button } from "@church-space/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  FountainPen,
  LoaderIcon,
  PaperPlaneClock,
  Reply,
  UserPen,
  Users,
} from "@church-space/ui/icons";

export default function ScheduledPage({ email: initialEmail }: { email: any }) {
  const [email] = useState<typeof initialEmail>(initialEmail);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const [cancelScheduleOpen, setCancelScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const supabase = createClient();

  // Initialize state from email data
  const [subject] = useState(email.subject || "");
  const [listId] = useState(email.list_id || "");

  // From details
  const [fromEmail] = useState(email.from_email || "");
  const [fromDomain] = useState(email.from_email_domain?.toString() || "");
  const [fromName] = useState(email.from_name || "");
  const [replyToEmail] = useState(email.reply_to || "");
  const [replyToDomain] = useState(email.reply_to_domain?.toString() || "");

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
  const [sendDate] = useState<Date | null>(
    email.scheduled_for ? new Date(email.scheduled_for) : null,
  );

  // Format date helper function
  const formatDate = (date: Date | null, showTimezone = true) => {
    if (!date) return "";

    // Format date as "Mar. 3, 2025"
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    // Format time without seconds
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    if (showTimezone) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return `${formattedDate} at ${formattedTime} (${timeZone})`;
    } else {
      return `${formattedDate} at ${formattedTime}`;
    }
  };

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/emails">Email</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  {email.subject || "Untitled Email"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <Dialog
            open={cancelScheduleOpen}
            onOpenChange={setCancelScheduleOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">Cancel Schedule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Schedule</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you want to cancel this schedule?
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline">
                  Close{" "}
                  <span className="rounded bg-muted px-1 text-xs text-muted-foreground">
                    Esc
                  </span>
                </Button>
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await cancelScheduledEmail({ emailId: email.id });
                      setCancelScheduleOpen(false);
                      router.refresh();
                      window.location.reload();
                    } catch (error) {
                      console.error("Failed to cancel schedule", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  Cancel Schedule
                  {isLoading && (
                    <div className="animate-spin">
                      <LoaderIcon />
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={previewOpen === "true"}
            onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setPreviewOpen("true");
                }}
              >
                <span className="hidden md:block">Preview Email</span>
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
        </div>
      </header>
      <h1 className="mx-auto mb-2 mt-8 w-full max-w-3xl items-center text-balance px-5">
        {subject ? (
          <span className="text-2xl font-bold">{subject}</span>
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">
            Email
          </span>
        )}{" "}
        <span className="ml-1.5 text-2xl text-muted-foreground">
          is scheduled for
        </span>
        <span className="ml-1.5 text-2xl font-bold text-foreground">
          {formatDate(sendDate, false)}
        </span>
      </h1>

      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <Card>
          <CardHeader className="sr-only">
            <CardTitle className="sr-only text-lg font-bold">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-start font-medium text-primary">
              <div className="flex items-center gap-1">
                <Users /> To:
              </div>
              <div className="ml-5 text-foreground">
                <div className="flex items-baseline gap-2">
                  {listData?.data?.[0]?.pco_list_description}{" "}
                  <div className="text-sm text-muted-foreground">
                    {listData?.data?.[0]?.pco_total_people}{" "}
                    {listData?.data?.[0]?.pco_total_people === "1"
                      ? "person"
                      : "people"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {listData?.data?.[0]?.pco_list_categories?.pco_name}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start font-medium text-primary">
              <div className="flex items-center gap-1">
                <UserPen /> From:
              </div>
              <div className="ml-5 text-foreground">
                <div className="flex items-baseline gap-2">{fromName}</div>
                <div className="text-sm text-muted-foreground">
                  {fromEmail}
                  {fromDomain ? `@${domainData?.data?.[0]?.domain}` : ""}
                </div>
              </div>
            </div>
            {replyToEmail && (
              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex items-center gap-1">
                  <Reply /> Reply-To:
                </div>
                <div className="ml-5 text-foreground">
                  <div className="flex items-baseline gap-2">
                    {replyToEmail}
                    {replyToDomain
                      ? `@${replyToDomainData?.data?.[0]?.domain}`
                      : ""}
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-start gap-1 font-medium text-primary">
              <div className="flex items-center gap-1">
                <FountainPen /> Subject:
              </div>
              <div className="ml-5 text-foreground">{subject}</div>
            </div>
            <div className="flex flex-col items-start font-medium text-primary">
              <div className="flex items-center gap-1">
                <PaperPlaneClock /> Scheduled For:
              </div>
              <div className="ml-5 text-foreground">{formatDate(sendDate)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
