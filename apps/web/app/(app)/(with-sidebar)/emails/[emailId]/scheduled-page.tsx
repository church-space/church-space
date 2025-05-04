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
import { useRouter } from "next/navigation";
import { cancelScheduledEmail } from "@/actions/cancel-schedule-email";
import { createClient } from "@church-space/supabase/client";
import { getPcoListQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import {
  Breadcrumb,
  BreadcrumbItem,
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
  Email,
  FountainPen,
  LoaderIcon,
  PaperPlaneClock,
  Reply,
  UserPen,
  Users,
} from "@church-space/ui/icons";
import { motion } from "framer-motion";
import { getEmailCategoryById } from "@church-space/supabase/queries/all/get-all-email-categories";
import Link from "next/link";
import { Maximize2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};

export default function ScheduledPage({
  email: initialEmail,
  orgFooterDetails,
}: {
  email: any;
  orgFooterDetails: any;
}) {
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
  const [categoryId] = useState(email.email_category || "");

  // Fetch list and domain data
  const { data: listData } = useQuery({
    queryKey: ["pcoList", listId],
    queryFn: () => getPcoListQuery(supabase, parseInt(listId || "0")),
    enabled: !!listId,
  });

  const { data: categoryData } = useQuery({
    queryKey: ["emailCategory", categoryId],
    queryFn: () =>
      getEmailCategoryById(
        supabase,
        email.organization_id,
        parseInt(categoryId || "0"),
      ),
    enabled: !!categoryId,
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
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/emails" className="hidden md:block">
                <BreadcrumbItem>Emails</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  {email.subject || "Untitled Email"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-2">
          <Dialog
            open={cancelScheduleOpen}
            onOpenChange={setCancelScheduleOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full gap-1">
                Cancel<span className="hidden md:inline"> Schedule</span>
              </Button>
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
        </div>
      </header>
      <motion.div
        className="mx-auto mb-2 mt-8 flex items-center px-5 md:px-9"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary bg-secondary/80 text-primary shadow-lg shadow-primary/20">
          <Email height={"20"} width={"20"} />
        </div>
        <h1 className="text-2xl">
          <motion.span className="font-bold" variants={itemVariants}>
            {subject || "New email"}
          </motion.span>{" "}
          <motion.span
            className="text-muted-foreground"
            variants={itemVariants}
          >
            is scheduled for
          </motion.span>{" "}
          <motion.span className="font-bold" variants={itemVariants}>
            {formatDate(sendDate, false)}
          </motion.span>
        </h1>
      </motion.div>

      <motion.div
        className="mx-auto w-full space-y-4 px-4 py-4 md:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex h-[calc(100vh-170px)] w-full items-start gap-4 xl:gap-8">
          <motion.div
            variants={itemVariants}
            className="w-full max-w-4xl space-y-4 overflow-y-auto"
          >
            <Card className="w-full max-w-4xl space-y-4 overflow-y-auto">
              <CardContent className="flex flex-row items-center gap-3.5 py-4">
                <span className="text-primary">
                  <Users height={"20"} width={"20"} />
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-primary">To:</span>
                  <div className="text-foreground">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-medium">
                        {listData?.data?.[0]?.pco_list_description}{" "}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        ({listData?.data?.[0]?.pco_total_people}{" "}
                        {listData?.data?.[0]?.pco_total_people === "1"
                          ? "person"
                          : "people"}
                        ))
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {categoryData?.data?.[0]?.name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full max-w-4xl space-y-4 overflow-y-auto">
              <CardContent className="flex flex-row items-center gap-3.5 py-4">
                <span className="text-primary">
                  <UserPen height={"20"} width={"20"} />
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-primary">From:</span>
                  <div className="text-foreground">
                    <div className="flex items-baseline gap-1.5">
                      <div className="flex items-baseline gap-2 font-medium">
                        {fromName}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {fromEmail}
                    {fromDomain ? `@${domainData?.data?.[0]?.domain}` : ""}
                  </div>
                </div>
              </CardContent>
            </Card>
            {replyToEmail && (
              <Card className="w-full max-w-4xl space-y-4 overflow-y-auto">
                <CardContent className="flex flex-row items-center gap-3.5 py-4">
                  <span className="text-primary">
                    <Reply height={"20"} width={"20"} />
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-primary">
                      Reply-To:
                    </span>
                    <div className="text-foreground">
                      <div className="flex items-baseline gap-1.5">
                        <div className="flex items-baseline gap-2 font-medium">
                          {replyToEmail}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {replyToEmail}
                      {replyToDomain
                        ? `@${replyToDomainData?.data?.[0]?.domain}`
                        : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="w-full max-w-4xl space-y-4 overflow-y-auto">
              <CardContent className="flex flex-row items-center gap-3.5 py-4">
                <span className="text-primary">
                  <FountainPen height={"20"} width={"20"} />
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-primary">
                    Subject:
                  </span>
                  <div className="text-foreground">
                    <div className="flex items-baseline gap-1.5">
                      <div className="flex items-baseline gap-2 font-medium">
                        {subject}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full max-w-4xl space-y-4 overflow-y-auto">
              <CardContent className="flex flex-row items-center gap-3.5 py-4">
                <span className="text-primary">
                  <PaperPlaneClock height={"20"} width={"20"} />
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-primary">
                    Scheduled For:
                  </span>
                  <div className="text-foreground">
                    <div className="flex items-baseline gap-1.5">
                      <div className="flex items-baseline gap-2 font-medium">
                        {formatDate(sendDate, false)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <div className="relative hidden w-[50%] flex-col gap-1 overflow-y-auto rounded-lg border bg-muted shadow-sm lg:flex">
            <div className="sticky top-0 flex w-full items-center justify-between px-3.5 pt-2">
              <h4 className="font-medium">Preview</h4>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setPreviewOpen("true");
                }}
              >
                <Maximize2 />
              </Button>
            </div>
            <div className="overflow-auto p-2">
              <EmailPreview
                webOnly={true}
                orgFooterDetails={orgFooterDetails?.data?.data}
                customHeight="h-[calc(100vh-252px)] rounded-lg"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
