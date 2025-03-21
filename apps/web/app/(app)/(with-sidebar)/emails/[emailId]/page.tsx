import { getCachedEmail } from "@church-space/supabase/queries/cached/emails";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@church-space/ui/breadcrumb";
import { Button } from "@church-space/ui/button";
import { Separator } from "@church-space/ui/separator";
import { SidebarTrigger } from "@church-space/ui/sidebar";
import { cookies } from "next/headers";
import PreSendPage from "./pre-send-page";
import PostSendPage from "./post-send-page";
import SendingPage from "./sending-page";
import { redirect } from "next/navigation";
import TempSendNowButton from "./temp-send-now-button";

type Params = Promise<{ emailId: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const emailId = parseInt(params.emailId, 10);

  const email = await getCachedEmail(emailId);

  if (!email || !email.data) {
    return <div>Email not found</div>;
  }

  if (email.data.type === "template") {
    redirect(`/emails/${emailId}/editor`);
  }

  // Get organizationId from cookies
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  console.log(organizationId);

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
                <BreadcrumbPage>{email.data.subject}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 px-4">
          <Button variant="outline">Send Test</Button>
          <TempSendNowButton />
        </div>
      </header>
      {email.data.status === "sending" && <SendingPage />}
      {email.data.status === "sent" && <PostSendPage />}
      {(email.data.status === "draft" || email.data.status === "scheduled") && (
        <PreSendPage email={email.data} />
      )}
    </>
  );
}
