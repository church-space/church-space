import DefaultFooterEditor from "@/components/dnd-builder/default-footer-editor";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Footer",
};

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    return null;
  }

  return <DefaultFooterEditor organizationId={organizationId} />;
}
