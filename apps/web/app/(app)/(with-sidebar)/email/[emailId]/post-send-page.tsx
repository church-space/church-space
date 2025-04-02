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
                <BreadcrumbLink href="/email">Email</BreadcrumbLink>
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
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <h1 className="mb-2 mt-8 text-2xl font-bold">Post Send Page</h1>
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold">Details</h2>
        <p>Email details</p>
        <p>Email preview</p>
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold">Stats</h2>
        <p>open rate</p>
        <p>total opens</p>
        <p>click rate</p>
        <p>total clicks</p>
        <p>unsubscribe rate</p>
        <p>total unsubscribes</p>
        <p>bounced rate</p>
        <p>total bounces</p>
        <p>complaints rate</p>
        <p>total complaints</p>
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold">Link Stats</h2>
        <p>Link stats (clicks per link)</p>
        <Separator className="my-4" />
        <h2 className="text-xl font-semibold">Recipients</h2>
        <p>recipeients (unsubscribed, link clicked, status, etc.)</p>
      </div>
    </>
  );
}
