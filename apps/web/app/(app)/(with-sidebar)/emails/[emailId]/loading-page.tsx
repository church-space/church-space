import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Button } from "@church-space/ui/button";
import { Skeleton } from "@church-space/ui/skeleton";

export default function LoadingPage() {
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
                <BreadcrumbPage>Loading...</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <Button variant="outline">
            <Skeleton className="h-4 w-16" />
          </Button>
        </div>
      </header>
      <div className="min-h-[calc(100vh-10rem)] w-full px-8 pt-3">
        <Skeleton className="flex min-h-[calc(100vh-7rem)] w-full items-center justify-center bg-secondary/30 px-5">
          <div className="flex flex-col items-center gap-3">
            <div className="text-muted-foreground">Getting things ready...</div>
          </div>
        </Skeleton>
      </div>
    </>
  );
}
