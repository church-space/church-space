import AutomationMembersTable from "@/components/tables/automation-members/table";
import React from "react";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { Separator } from "@church-space/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@church-space/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@church-space/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import DataTableLoading from "@/components/tables/data-table-loading";
import { columns } from "@/components/tables/automation-members/columns";
export default function LoadingPage() {
  return (
    <div className="relative">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <Link prefetch={true} href="/emails">
                  Emails
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <Link prefetch={true} href="/emails/automations">
                  Automations
                </Link>
              </BreadcrumbItem>
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

          <Button disabled className="cursor-pointer" variant="default">
            Enabled
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="flex flex-col space-y-6">
          {/* Link Information Section */}
          <div className="flex w-full justify-between gap-4 border-b pb-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="group flex-1 cursor-pointer">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <h2 className="text-2xl font-bold text-muted-foreground transition-colors group-hover:text-primary">
                        Loading...
                      </h2>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-muted-foreground">Loading...</p>
              </div>

              <Button>Edit Steps</Button>
            </div>
          </div>
          <>
            <div className="flex w-full flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">
                  <span className="font-normal text-muted-foreground">0</span>{" "}
                  Automation Members
                </h1>
                <p className="text-sm text-muted-foreground">
                  Note: a person can only go through the automation once.
                </p>
              </div>
            </div>
            <DataTableLoading columns={columns} />
          </>
        </div>
      </div>
    </div>
  );
}
