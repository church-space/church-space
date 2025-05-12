import React from "react";

import LinkListBuilder from "@/components/link-list-builder/link-list-builder";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Pages",
};

export default async function Page() {
  const cookiesStore = await cookies();
  const organizationId = cookiesStore.get("organizationId")?.value;

  if (!organizationId) {
    return null;
  }

  return <LinkListBuilder organizationId={organizationId} />;
}
