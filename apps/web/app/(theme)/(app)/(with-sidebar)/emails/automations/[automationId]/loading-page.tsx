import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Skeleton } from "@church-space/ui/skeleton";
import { Ellipsis } from "lucide-react";
import Link from "next/link";

export default function LoadingPage() {
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
              <Link href="/emails/automations" className="hidden md:block">
                <BreadcrumbItem>Automations</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />

              <BreadcrumbItem>
                <BreadcrumbPage>Loading...</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-2">
          <Button variant="ghost" size="icon">
            <Ellipsis className="h-4 w-4" />
          </Button>
          <Button disabled variant="default">
            Enable
          </Button>
        </div>
      </header>
      <div className="min-h-[calc(100vh-10rem)] w-full px-8 pt-3">
        <div className="flex min-h-[calc(100vh-7rem)] w-full items-center justify-center px-5">
          <div className="flex flex-col items-center gap-3">
            <div className="text-muted-foreground">Getting things ready...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
