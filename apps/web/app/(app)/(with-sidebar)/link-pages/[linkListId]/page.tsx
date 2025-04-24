import React from "react";

import LinkListBuilder from "@/components/link-list-builder/link-list-builder";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    redirect("/onboarding");
  }

  return <LinkListBuilder organizationId={organizationId} />;
}
