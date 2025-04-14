import DefaultFooterEditor from "@/components/dnd-builder/default-footer-editor";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  return <DefaultFooterEditor organizationId={organizationId} />;
}
