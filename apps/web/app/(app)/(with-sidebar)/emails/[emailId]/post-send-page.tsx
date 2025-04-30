"use client";

import EmailPreview from "@/components/dnd-builder/email-preview";
import { EmailRecipientStatus } from "@/components/tables/email-recipients/filters";
import EmailRecipientsTable from "@/components/tables/email-recipients/table";
import { createClient } from "@church-space/supabase/client";
import { getDomainQuery } from "@church-space/supabase/queries/all/get-domains";
import { getPcoListQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import { cn } from "@church-space/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import {
  EmailBounced,
  EmailComplained,
  EmailOpened,
  EmailUnsubscribed,
  LinkIcon,
  Users,
} from "@church-space/ui/icons";
import { Input } from "@church-space/ui/input";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@church-space/ui/table";
import { useToast } from "@church-space/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { createEmailTemplateFromEmailAction } from "@/actions/create-email-template-from-email";
import { getEmailRecipientsAction } from "@/actions/get-email-recipients";
import { getEmailCategoryById } from "@church-space/supabase/queries/all/get-all-email-categories";
import { duplicateEmailAction } from "@/actions/duplicate-email-action";
import { useRouter } from "next/navigation";

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

export default function PostSendPage({
  initialEmail,
  stats,
  orgFooterDetails,
}: {
  initialEmail: any;
  stats: any;
  orgFooterDetails: any;
}) {
  const [email] = useState<typeof initialEmail>(initialEmail);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");
  const [search] = useQueryState("search", {
    parse: (value) => value,
    serialize: (value) => value ?? null,
  });
  const [status] = useQueryState<EmailRecipientStatus | null>("status", {
    parse: (value) => value as EmailRecipientStatus | null,
    serialize: (value) => value || "all",
  });

  const router = useRouter();

  // State for Save as Template functionality
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] =
    useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDuplicatingEmail, setIsDuplicatingEmail] = useState(false);
  const [duplicateEmailName, setDuplicateEmailName] = useState("");
  const { toast } = useToast();

  // State for duplicate email dialog
  const [isDuplicateEmailDialogOpen, setIsDuplicateEmailDialogOpen] =
    useState(false);

  const supabase = createClient();

  // Initialize state from email data
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
    email.sent_at ? new Date(email.sent_at) : null,
  );

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

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const result = await createEmailTemplateFromEmailAction({
        subject: templateName,
        organization_id: email.organization_id,
        source_email_id: email.id,
      });

      const resultObj = result as any;

      if (resultObj && resultObj.data) {
        toast({
          title: "Success",
          description: "Email template saved successfully",
        });
        setIsSaveTemplateDialogOpen(false);
        setTemplateName("");
        // Optionally: Invalidate or refetch template list if needed
      } else {
        let errorMessage = "Failed to save template";
        if (resultObj && typeof resultObj.error === "string") {
          errorMessage = resultObj.error;
        }
        console.error("Error saving template:", errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception saving template:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDuplicateEmail = async () => {
    if (!duplicateEmailName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    setIsDuplicatingEmail(true);
    try {
      const result = await duplicateEmailAction({
        subject: duplicateEmailName,
        organization_id: email.organization_id,
        source_email_id: email.id,
      });

      const resultObj = result as any;

      if (resultObj && resultObj.data) {
        toast({
          title: "Success",
          description: "Email duplicated successfully",
        });
        router.push(`/emails/${resultObj.data.data.id}`);
        setIsDuplicatingEmail(false);
        setDuplicateEmailName("");
      } else {
        let errorMessage = "Failed to duplicate email";
        if (resultObj && typeof resultObj.error === "string") {
          errorMessage = resultObj.error;
        }
        console.error("Error duplicating email:", errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception duplicating email:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDuplicatingEmail(false);
    }
  };

  const emailStats = [
    {
      icon: EmailOpened,
      color: "green",
      title: "opens",
      count: stats?.data?.metrics?.total_opens ?? 0,
      rate: stats?.data?.metrics?.total_sent
        ? Math.round(
            (stats.data.metrics.total_opens / stats.data.metrics.total_sent) *
              100,
          )
        : 0,
    },
    {
      icon: EmailUnsubscribed,
      color: "yellow",
      title: "unsubscribes",
      count: stats?.data?.metrics?.total_unsubscribes ?? 0,
      rate: stats?.data?.metrics?.total_sent
        ? Math.round(
            (stats.data.metrics.total_unsubscribes /
              stats.data.metrics.total_sent) *
              100,
          )
        : 0,
    },
    {
      icon: EmailBounced,
      color: "red",
      title: "bounces",
      count: stats?.data?.metrics?.total_bounces ?? 0,
      rate: stats?.data?.metrics?.total_sent
        ? Math.round(
            (stats.data.metrics.total_bounces / stats.data.metrics.total_sent) *
              100,
          )
        : 0,
    },
    {
      icon: EmailComplained,
      color: "red",
      title: "complaints",
      count: stats?.data?.metrics?.total_complaints ?? 0,
      rate: stats?.data?.metrics?.total_sent
        ? Math.round(
            (stats.data.metrics.total_complaints /
              stats.data.metrics.total_sent) *
              100,
          )
        : 0,
    },
  ];

  const { data: recipients } = useQuery({
    queryKey: ["emailRecipients", email.id],
    queryFn: () => getEmailRecipientsAction({ emailId: email.id }),
  });

  // Transform the recipients data to match the expected type
  const transformedRecipients =
    recipients?.data?.data?.map((recipient: any) => {
      return {
        id: recipient.id,
        email_address:
          recipient.email_address || recipient.person?.email || null,
        status: recipient.status,
        created_at: recipient.created_at,
        updated_at: recipient.updated_at,
        person:
          recipient.person &&
          (recipient.person.first_name || recipient.person.last_name)
            ? {
                first_name: recipient.person.first_name || null,
                last_name: recipient.person.last_name || null,
              }
            : null,
      };
    }) || [];

  return (
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Link href="/emails" prefetch={true}>
                  Emails
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-32 truncate sm:max-w-sm">
                  {email?.subject || "(No Subject)"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4"></div>
      </header>
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mb-4 flex flex-row items-center justify-between"
          variants={itemVariants}
        >
          <h1 className="text-2xl font-bold">{email?.subject}</h1>

          <div className="flex items-center gap-2">
            <Dialog
              open={previewOpen === "true"}
              onOpenChange={(open) => setPreviewOpen(open ? "true" : null)}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setPreviewOpen("true");
                  }}
                  className="hidden sm:block"
                >
                  View Email
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[95%] min-w-[95%] p-4">
                <DialogHeader className="sr-only">
                  <DialogTitle>Preview</DialogTitle>
                </DialogHeader>

                <EmailPreview orgFooterDetails={orgFooterDetails?.data?.data} />
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Dialog
                  open={isSaveTemplateDialogOpen}
                  onOpenChange={setIsSaveTemplateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
                    >
                      Save as Template
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Email as Template</DialogTitle>
                      <DialogDescription>
                        Enter a name for this template. It will be saved with
                        the current email content.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="Template name"
                      className="mb-3 w-full"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      maxLength={60}
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsSaveTemplateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveTemplate}
                        disabled={isSavingTemplate}
                      >
                        {isSavingTemplate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isDuplicateEmailDialogOpen}
                  onOpenChange={setIsDuplicateEmailDialogOpen}
                >
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
                    >
                      Replicate as New Email
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Duplicate Email</DialogTitle>
                      <DialogDescription>
                        Enter a subject for the new email. It will be created as
                        a draft with the same content and settings as the
                        original.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="New email subject"
                      className="mb-3 w-full"
                      value={duplicateEmailName}
                      onChange={(e) => setDuplicateEmailName(e.target.value)}
                      maxLength={100} // Or appropriate length
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDuplicateEmailDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDuplicateEmail}
                        disabled={isDuplicatingEmail}
                      >
                        {isDuplicatingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Duplicating...
                          </>
                        ) : (
                          "Duplicate"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
        {email.error_message && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <Card className="mx-auto w-full border-destructive bg-destructive/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground">
                  Email Sent with an Error
                </CardTitle>
              </CardHeader>
              {email.error_message && (
                <CardContent className="mx-6 mb-4 mt-2 rounded-md border border-destructive bg-muted px-3 pb-2 pt-2 font-mono text-sm">
                  {email.error_message}
                </CardContent>
              )}
              <CardFooter>
                <Link
                  href={`mailto:support@churchspace.co?subject=Email%20Failed%20to%20Send&body=My%20email%20failed%20to%20send.%20Can%20you%20please%20investigate%20and%20let%20me%20know%20what%20to%20do%3F%0A%0AEmail%20ID%3A%20${email.id}${email.error_message ? `%0A%0AError%20Message%3A%20${encodeURIComponent(email.error_message)}` : ""}%0A%0AThanks!`}
                >
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex items-start gap-1">
                  To:
                  <div className="text-foreground">
                    <div className="items-baseline space-x-2">
                      {listData?.data?.[0]?.pco_list_description}{" "}
                      <span className="text-sm text-muted-foreground">
                        {listData?.data?.[0]?.pco_total_people}{" "}
                        {listData?.data?.[0]?.pco_total_people === "1"
                          ? "person"
                          : "people"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-foreground">
                  <div className="text-sm text-muted-foreground">
                    {categoryData?.data?.[0]?.name}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex items-center gap-1">
                  From:
                  <div className="text-foreground">{fromName}</div>
                </div>
                <div className="text-foreground">
                  <div className="text-sm text-muted-foreground">
                    {fromEmail}
                    {fromDomain ? `@${domainData?.data?.[0]?.domain}` : ""}
                  </div>
                </div>
              </div>
              {replyToEmail && (
                <div className="flex flex-col items-start font-medium text-primary">
                  <div className="flex items-center gap-1">
                    Reply-To:
                    <div className="text-foreground">
                      <div className="flex items-baseline gap-2">
                        {replyToEmail}
                        {replyToDomain
                          ? `@${replyToDomainData?.data?.[0]?.domain}`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex flex-shrink-0 items-center gap-1">
                  Sent At:
                  <div className="text-foreground">{formatDate(sendDate)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="px-4 pb-1.5 pt-4">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-blue-500 bg-blue-500/10 text-blue-500">
                  <LinkIcon height={"20"} width={"20"} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  Link Clicks
                  <span className="font-normal text-muted-foreground">
                    ({stats?.data?.metrics?.total_clicks || 0} total)
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[178px] overflow-y-auto px-4 pr-5">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.data?.linkStats?.map(
                    (
                      linkStat: { link_url: string; total_clicks: number },
                      index: number,
                    ) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-[240px] truncate">
                          <span className="block cursor-pointer truncate text-blue-500 hover:overflow-visible hover:text-clip hover:underline">
                            {linkStat.link_url}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {linkStat.total_clicks}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
          variants={itemVariants}
        >
          {emailStats.map((stat, index) => (
            <Card
              key={index}
              className="flex items-center gap-3.5 overflow-hidden p-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-${stat.color}-500 bg-${stat.color}-500/10 text-${stat.color}-500`}
              >
                <stat.icon height={"20"} width={"20"} />
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex w-full items-center justify-between gap-2">
                  <p className="text-sm capitalize leading-none text-muted-foreground">
                    {stat.title}
                  </p>
                  <p
                    className={cn(
                      "text-sm leading-none",
                      // Open rate thresholds
                      stat.title === "opens"
                        ? stat.rate > 25
                          ? "text-green-500"
                          : stat.rate >= 15
                            ? "text-yellow-500"
                            : "text-red-500"
                        : // Unsubscribe rate thresholds
                          stat.title === "unsubscribes"
                          ? stat.rate < 0.2
                            ? "text-green-500"
                            : stat.rate <= 0.5
                              ? "text-yellow-500"
                              : "text-red-500"
                          : // Bounce rate thresholds
                            stat.title === "bounces"
                            ? stat.rate < 0.5
                              ? "text-green-500"
                              : stat.rate <= 1
                                ? "text-yellow-500"
                                : "text-red-500"
                            : // Complaint rate thresholds
                              stat.rate < 0.01
                              ? "text-green-500"
                              : stat.rate <= 0.05
                                ? "text-yellow-500"
                                : "text-red-500",
                    )}
                  >
                    {stat.rate}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold leading-none">
                    {stat.count.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
        <motion.div
          className="flex w-full -translate-y-2 flex-col items-end justify-end text-xs text-muted-foreground xl:flex-row xl:justify-between"
          variants={itemVariants}
        >
          <p>
            {stats?.data?.metrics?.updated_at &&
              `Last updated: ${formatDate(
                new Date(stats?.data?.metrics?.updated_at),
              )}`}
          </p>
          <p>* Stats updated once per hour for the first week after sending.</p>
        </motion.div>
        <motion.div
          className="mt-8 flex flex-col gap-4"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 text-lg font-bold">
            <div className="border-purple -500 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-purple-500/10 text-purple-500">
              <Users height={"20"} width={"20"} />
            </div>
            <h1 className="flex items-baseline gap-1.5">
              Recipients
              <span className="font-normal text-muted-foreground">
                ({stats?.data?.metrics?.total_sent} total)
              </span>
            </h1>
          </div>

          <EmailRecipientsTable
            emailId={email.id}
            initialData={transformedRecipients}
            initialCount={recipients?.data?.count ?? 0}
            initialSearch={search ?? ""}
            initialStatus={status ?? "all"}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
