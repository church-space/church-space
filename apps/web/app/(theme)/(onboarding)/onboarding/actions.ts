"use server";

import { cookies } from "next/headers";

export async function handleExpiredInvite() {
  const cookieStore = await cookies();
  cookieStore.delete("invite");
}
