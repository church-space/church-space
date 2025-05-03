"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

export async function setCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value);
}

export async function processInviteSuccess(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.delete("invite");
  cookieStore.set("organization_id", organizationId);
  return redirect("/hello");
}

export async function handleExpiredInvite() {
  const cookieStore = await cookies();
  cookieStore.delete("invite");
}
