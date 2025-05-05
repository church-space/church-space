"use server";

import { cookies } from "next/headers";

export async function setOrgCookie(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("organizationId", organizationId);
}
