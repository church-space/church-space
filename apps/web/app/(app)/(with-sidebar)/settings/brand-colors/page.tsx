import {
  SettingsContent,
  SettingsHeader,
  SettingsSection,
  SettingsTitle,
} from "@/components/settings/settings-settings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import ClientPage from "./client-page";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  if (!organizationId) {
    return <div>No organization ID found</div>;
  }

  return (
    <div className="relative">
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <Link href="/settings" className="hidden md:block">
                <BreadcrumbItem>Settings</BreadcrumbItem>
              </Link>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Brand Colors</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-16 p-4 pt-8">
        <SettingsSection>
          <SettingsHeader>
            <SettingsTitle>Brand Colors</SettingsTitle>
          </SettingsHeader>
          <SettingsContent>
            <ClientPage organizationId={organizationId} />
          </SettingsContent>
        </SettingsSection>
      </div>
    </div>
  );
}
