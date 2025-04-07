"use client";
import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@church-space/ui/card";
import {
  EmailBounced,
  EmailComplained,
  EmailOpened,
  EmailUnsubscribed,
} from "@church-space/ui/icons";
import { Button } from "@church-space/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@church-space/ui/table";
import Link from "next/link";
export default function PostSendPage({ email }: { email: any }) {
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
                  {email?.subject || "(No Subject)"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4"></div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <Card className="flex flex-row items-center justify-between">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {email?.subject}
            </CardTitle>
            <CardDescription>
              <p>Email details</p>
              <p>Email preview</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pr-6">
            <Button>View Email</Button>
          </CardContent>
        </Card>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Card className="flex flex-col gap-2 overflow-hidden p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-green-500 bg-green-500/10 text-green-500">
                  <EmailOpened height={"20"} width={"20"} />
                </div>
                <p className="text-lg font-bold">10 opens</p>
              </div>
              <p className="text-sm text-muted-foreground">32% open rate</p>
            </Card>
            <Card className="flex flex-col gap-2 overflow-hidden p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-yellow-500 bg-yellow-500/10 text-yellow-500">
                  <EmailUnsubscribed height={"20"} width={"20"} />
                </div>
                <p className="text-lg font-bold">1,000 unsubscribes</p>
              </div>
              <p className="text-sm text-muted-foreground">
                32% unsubscribe rate
              </p>
            </Card>
            <Card className="flex flex-col gap-2 overflow-hidden p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-500 bg-red-500/10 text-red-500">
                  <EmailBounced height={"20"} width={"20"} />
                </div>
                <p className="text-lg font-bold">10 bounces</p>
              </div>
              <p className="text-sm text-muted-foreground">32% bounce rate</p>
            </Card>
            <Card className="flex flex-col gap-2 overflow-hidden p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-500 bg-red-500/10 text-red-500">
                  <EmailComplained height={"20"} width={"20"} />
                </div>
                <p className="text-lg font-bold">10 complaints</p>
              </div>
              <p className="text-sm text-muted-foreground">
                32% complaint rate
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Link Clicks{" "}
                <span className="font-normal text-muted-foreground">
                  (10 total)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[220px] overflow-y-auto px-4 pr-5">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="max-w-[200px] truncate">
                        <span className="block cursor-pointer truncate text-blue-500 hover:overflow-visible hover:text-clip hover:underline">
                          https://www.stefanjudis.com/snippets/turn-off-password-managers/asdfasdf/asdfas
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{index + 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>recipeients (unsubscribed, link clicked, status, etc.)</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
