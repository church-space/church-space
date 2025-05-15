import ClientPage from "./client-page";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branding",
};

export default async function Page() {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organizationId")?.value;

  if (!organizationId) {
    return <div>No organization ID found</div>;
  }

  return <ClientPage organizationId={organizationId} />;
}
