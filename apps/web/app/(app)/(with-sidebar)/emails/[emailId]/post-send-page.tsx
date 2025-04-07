"use client";
import EmailPreview from "@/components/dnd-builder/email-preview";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@church-space/ui/dialog";
import {
  EmailBounced,
  EmailComplained,
  EmailOpened,
  EmailUnsubscribed,
  LinkIcon,
  PaperPlaneClock,
  Reply,
  UserPen,
  Users,
} from "@church-space/ui/icons";
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
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";

export default function PostSendPage({
  initialEmail,
  stats,
}: {
  initialEmail: any;
  stats: any;
}) {
  const [email] = useState<typeof initialEmail>(initialEmail);
  const [previewOpen, setPreviewOpen] = useQueryState("previewOpen");

  const supabase = createClient();

  // Initialize state from email data
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

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Link href="/emails" prefetch={true}>
                  Email
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="mb-4 flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">{email?.subject}</h1>

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
                View Email
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
        {email.error_message && (
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
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex items-center gap-1">
                  <Users /> To:
                  <div className="text-foreground">
                    <div className="flex items-baseline gap-2">
                      {listData?.data?.[0]?.pco_list_description}{" "}
                      <div className="text-sm text-muted-foreground">
                        {listData?.data?.[0]?.pco_total_people}{" "}
                        {listData?.data?.[0]?.pco_total_people === "1"
                          ? "person"
                          : "people"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 text-foreground">
                  <div className="text-sm text-muted-foreground">
                    {listData?.data?.[0]?.pco_list_categories?.pco_name}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start font-medium text-primary">
                <div className="flex items-center gap-1">
                  <UserPen /> From:
                  <div className="text-foreground">{fromName}</div>
                </div>
                <div className="ml-5 text-foreground">
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
                <div className="flex items-center gap-1">
                  <PaperPlaneClock /> Sent At:
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
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
                  <p className="text-sm leading-none text-green-500">
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
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-lg font-bold">
            <div className="border-purple -500 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-purple-500/10 text-purple-500">
              <Users height={"20"} width={"20"} />
            </div>
            <h1 className="flex items-baseline gap-1.5">
              Recipients
              <span className="font-normal text-muted-foreground">
                (10 total)
              </span>
            </h1>
          </div>

          <div>
            <p>recipeients (unsubscribed, link clicked, status, etc.)</p>
          </div>
        </div>
      </div>
    </>
  );
}
