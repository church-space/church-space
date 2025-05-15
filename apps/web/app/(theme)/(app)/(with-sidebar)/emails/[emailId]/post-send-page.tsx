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
  ChartBarAxisX,
  CursorClick,
  Email,
  EmailBounced,
  EmailComplained,
  EmailOpened,
  EmailUnsubscribed,
  LinkIcon,
  TemplatesIcon,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, MoreHorizontal, Plus, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { createEmailTemplateFromEmailAction } from "@/actions/create-email-template-from-email";
import { getEmailRecipientsAction } from "@/actions/get-email-recipients";
import { getEmailCategoryById } from "@church-space/supabase/queries/all/get-all-email-categories";
import { duplicateEmailAction } from "@/actions/duplicate-email-action";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsTrigger,
  TabsList,
  TabsContent,
} from "@church-space/ui/tabs";
import { Badge } from "@church-space/ui/badge";

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
  const [search] = useQueryState("search", {
    parse: (value) => value,
    serialize: (value) => value ?? null,
  });
  const [status] = useQueryState<EmailRecipientStatus | null>("status", {
    parse: (value) => value as EmailRecipientStatus | null,
    serialize: (value) => value || "all",
  });
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "details",
  });

  const router = useRouter();
  const queryClient = useQueryClient();

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
        // Invalidate emails query to refresh the list
        queryClient.invalidateQueries({
          queryKey: ["emails"],
          refetchType: "all",
        });

        // Also invalidate the specific email query
        queryClient.invalidateQueries({
          queryKey: ["email-id-page", resultObj.data.data.id],
        });

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
    queryFn: () =>
      getEmailRecipientsAction({
        emailId: email.id,
        count: stats?.data?.metrics?.total_sent ?? 0,
      }),
  });

  // Transform the recipients data to match the expected type
  const transformedRecipients =
    recipients?.data?.data?.map((recipient: any) => {
      return {
        id: recipient.id,
        email_address: recipient.email_address || null,
        status: recipient.status,
        created_at: recipient.created_at,
        updated_at: recipient.updated_at,
        first_name: recipient.first_name || null,
        last_name: recipient.last_name || null,
        unsubscribed: recipient.unsubscribed || false,
        clicked: recipient.clicked || false,
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
        <div className="flex items-center gap-2 px-4">
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
                    <SaveIcon />
                    Save as Template
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Email as Template</DialogTitle>
                    <DialogDescription>
                      Enter a name for this template. It will be saved with the
                      current email content.
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={isDuplicateEmailDialogOpen}
            onOpenChange={setIsDuplicateEmailDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                onSelect={(e) => e.preventDefault()} // Prevent DropdownMenu from closing
              >
                <TemplatesIcon />
                <span className="hidden sm:block">Replicate Email</span>
                <span className="block sm:hidden">Replicate</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Replicate Email</DialogTitle>
                <DialogDescription>
                  Enter a subject for the new email. It will be created as a
                  draft with the same content and settings as the original.
                </DialogDescription>
              </DialogHeader>
              <div className="relative mb-3">
                <Input
                  placeholder="New email subject"
                  className="w-full pr-8"
                  value={duplicateEmailName}
                  onChange={(e) => setDuplicateEmailName(e.target.value)}
                  maxLength={60} // Or appropriate length
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleDuplicateEmail();
                    }
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {duplicateEmailName.length} / 60
                </span>
              </div>
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
        </div>
      </header>

      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mb-4 flex flex-row items-center justify-between pt-12"
          variants={itemVariants}
        >
          <div className="flex flex-col items-start gap-2 pl-3">
            <h1 className="text-3xl font-bold">{email?.subject}</h1>
            <div className="flex items-center gap-1.5 text-base text-muted-foreground">
              <Badge variant="success" className="rounded-full text-sm">
                Sent
              </Badge>
              {formatDate(sendDate, false)}
            </div>
          </div>
        </motion.div>
        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-2 h-fit w-full justify-start rounded-none border-b bg-transparent p-0 shadow-none">
            <TabsTrigger
              value="details"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <ChartBarAxisX height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <ChartBarAxisX height={"16"} width={"16"} />
              </span>
              Details
            </TabsTrigger>
            <TabsTrigger
              value="recipients"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <Users height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <Users height={"16"} width={"16"} />
              </span>
              Recipients
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="h-10 gap-2 rounded-b-none border-primary px-4 py-0 hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:hover:bg-muted sm:text-base"
            >
              <span className="hidden sm:block">
                <Email height={"20"} width={"20"} />
              </span>
              <span className="block sm:hidden">
                <Email height={"16"} width={"16"} />
              </span>
              Content
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="flex flex-col gap-4">
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
              <Card className="border-primary bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-4">
                  <CardTitle className="font-bold">Details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-col items-start font-medium">
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold">To:</span>

                      <div className="">
                        <div className="items-baseline space-x-2 leading-none">
                          {listData?.data?.[0]?.pco_list_description}{" "}
                          <span className="text-sm text-muted-foreground">
                            ({listData?.data?.[0]?.pco_total_people}{" "}
                            {listData?.data?.[0]?.pco_total_people === "1"
                              ? "person"
                              : "people"}
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className="text-sm leading-tight text-muted-foreground">
                        {categoryData?.data?.[0]?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start font-medium">
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold">From:</span>

                      <div className="leading-none">{fromName}</div>
                    </div>

                    <div className="text-sm leading-tight text-muted-foreground">
                      {fromEmail}
                      {fromDomain ? `@${domainData?.data?.[0]?.domain}` : ""}
                    </div>
                  </div>
                  {replyToEmail && (
                    <div className="flex flex-col items-start font-medium">
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold">Reply-To:</span>
                        <div className="">
                          <div className="flex items-baseline gap-2 leading-tight">
                            {replyToEmail}
                            {replyToDomain
                              ? `@${replyToDomainData?.data?.[0]?.domain}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-start font-medium">
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold">Sent At:</span>

                      <div className="leading-none">
                        {formatDate(sendDate, false)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
                {emailStats.map((stat, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "flex items-center gap-3.5 overflow-hidden p-3",
                      (stat.title === "opens" && stat.rate > 25) ||
                        (stat.title === "unsubscribes" && stat.rate < 0.2) ||
                        (stat.title === "bounces" && stat.rate < 0.5) ||
                        (stat.title === "complaints" && stat.rate < 0.01)
                        ? "border-green-500 bg-gradient-to-br from-green-500/5 to-green-500/10"
                        : "border-red-500 bg-gradient-to-br from-red-500/5 to-red-500/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                        (stat.title === "opens" && stat.rate > 25) ||
                          (stat.title === "unsubscribes" && stat.rate < 0.2) ||
                          (stat.title === "bounces" && stat.rate < 0.5) ||
                          (stat.title === "complaints" && stat.rate < 0.01)
                          ? "border-green-500 bg-green-500/10 text-green-500"
                          : "border-red-500 bg-red-500/10 text-red-500",
                      )}
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
              </div>
            </motion.div>
            <motion.div
              className="space-y-4 rounded-xl border py-4 shadow"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 px-4 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary">
                  <ChartBarAxisX height={"20"} width={"20"} />
                </div>
                <div className="flex items-baseline gap-1.5">Email Metrics</div>
              </div>
              <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
                {emailStats.map((stat, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "flex items-center gap-3.5 overflow-hidden p-3",
                      (stat.title === "opens" && stat.rate > 25) ||
                        (stat.title === "unsubscribes" && stat.rate < 0.2) ||
                        (stat.title === "bounces" && stat.rate < 0.5) ||
                        (stat.title === "complaints" && stat.rate < 0.01)
                        ? "border-green-500 bg-gradient-to-br from-green-500/5 to-green-500/10"
                        : "border-red-500 bg-gradient-to-br from-red-500/5 to-red-500/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                        (stat.title === "opens" && stat.rate > 25) ||
                          (stat.title === "unsubscribes" && stat.rate < 0.2) ||
                          (stat.title === "bounces" && stat.rate < 0.5) ||
                          (stat.title === "complaints" && stat.rate < 0.01)
                          ? "border-green-500 bg-green-500/10 text-green-500"
                          : "border-red-500 bg-red-500/10 text-red-500",
                      )}
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
              </div>
              <div className="w-full border-t"></div>
              <div className="px-4">
                total recipeients, total opens, total unsubscribes, total
                bounces, total complaints, total clicks
              </div>
            </motion.div>
            <motion.div
              className="flex w-full -translate-y-2 flex-col items-end justify-end text-xs text-muted-foreground xl:flex-row xl:justify-between"
              variants={itemVariants}
            >
              {stats?.data?.metrics?.updated_at ? (
                <p>
                  Last updated:{" "}
                  {`${formatDate(new Date(stats?.data?.metrics?.updated_at))}`}
                </p>
              ) : (
                <p>Your email stats will be updated in a few minutes.</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="">
                <CardHeader className="px-4 pb-1.5 pt-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary">
                      <LinkIcon height={"20"} width={"20"} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      Link Clicks
                      <span className="font-normal text-muted-foreground">
                        ({stats?.data?.metrics?.total_clicks} total)
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pr-5">
                  {stats?.data?.metrics?.total_clicks ? (
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Link</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">
                            Percentage
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.data?.linkStats
                          ?.slice() // Create a shallow copy to avoid mutating the original array
                          ?.sort(
                            (
                              a: { link_url: string; total_clicks: number },
                              b: { link_url: string; total_clicks: number },
                            ) => b.total_clicks - a.total_clicks,
                          ) // Sort by total_clicks descending
                          ?.map(
                            (
                              linkStat: {
                                link_url: string;
                                total_clicks: number;
                              },
                              index: number,
                            ) => {
                              const totalClicks =
                                stats?.data?.metrics?.total_clicks || 0;
                              const percentage =
                                totalClicks > 0
                                  ? Math.round(
                                      (linkStat.total_clicks / totalClicks) *
                                        100,
                                    )
                                  : 0;
                              return (
                                <TableRow key={index}>
                                  <TableCell className="max-w-[240px] truncate">
                                    <span className="block cursor-pointer truncate font-semibold text-foreground hover:overflow-visible hover:text-clip hover:underline">
                                      {linkStat.link_url}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {linkStat.total_clicks}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {percentage}%
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg p-6">
                      <div className="relative mt-8 w-64">
                        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-md">
                          <div className="flex items-center gap-2">
                            <LinkIcon height={"20"} width={"20"} />
                            <div className="h-6 w-1/3 rounded bg-muted"></div>
                          </div>
                          <div className="h-4 w-full rounded bg-muted"></div>
                          <div className="h-4 w-3/4 rounded bg-muted"></div>
                        </div>
                        <div className="absolute -right-3 -top-3 rounded-full border bg-card p-1 shadow-sm">
                          <CursorClick />
                        </div>
                      </div>

                      <h3 className="mt-4 text-center text-xl font-medium text-muted-foreground">
                        No link clicks yet
                      </h3>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          <TabsContent value="recipients">
            <motion.div
              className="mt-4 flex flex-col gap-4"
              variants={itemVariants}
            >
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary">
                  <Users height={"20"} width={"20"} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  Recipients
                  <span className="font-normal text-muted-foreground">
                    ({stats?.data?.metrics?.total_sent} total)
                  </span>
                </div>
              </CardTitle>
              <EmailRecipientsTable
                emailId={email.id}
                initialData={transformedRecipients}
                initialCount={stats?.data?.metrics?.total_sent ?? 0}
                initialSearch={search ?? ""}
                initialStatus={status ?? "all"}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="content" className="w-full">
            <motion.div
              className="mt-4 flex flex-col gap-4"
              variants={itemVariants}
            >
              <EmailPreview
                orgFooterDetails={orgFooterDetails?.data?.data}
                customHeight="min-h-[calc(100vh-24rem)]"
                customTitle={
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary">
                      <Email height={"20"} width={"20"} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      Email Content
                    </div>
                  </CardTitle>
                }
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
