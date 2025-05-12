"use server";

import { cookies } from "next/headers";

export async function handleExpiredInvite() {
  console.log(`[handleExpiredInvite] Handling expired invite`);
  const cookieStore = await cookies();
  cookieStore.delete("invite");
  console.log(`[handleExpiredInvite] Invite cookie deleted`);
}
