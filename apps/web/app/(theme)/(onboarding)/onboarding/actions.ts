"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteCookie(name: string) {
  console.log(`[deleteCookie] Deleting cookie: ${name}`);
  const cookieStore = await cookies();
  cookieStore.delete(name);
  console.log(`[deleteCookie] Cookie deleted: ${name}`);
}

export async function setCookie(name: string, value: string) {
  console.log(`[setCookie] Setting cookie: ${name} with value: ${value}`);
  const cookieStore = await cookies();
  cookieStore.set(name, value);
  console.log(`[setCookie] Cookie set: ${name}`);
}

export async function processInviteSuccess(organizationId: string) {
  console.log(
    `[processInviteSuccess] Processing successful invite for organization: ${organizationId}`,
  );
  // Instead of modifying cookies and redirecting here, we'll just redirect with a special parameter
  console.log(
    `[processInviteSuccess] Redirecting to /hello?org=${organizationId}`,
  );
  return redirect(`/hello?org=${organizationId}`);
}

export async function handleExpiredInvite() {
  console.log(`[handleExpiredInvite] Handling expired invite`);
  const cookieStore = await cookies();
  cookieStore.delete("invite");
  console.log(`[handleExpiredInvite] Invite cookie deleted`);
}

export async function handleSuccessfulInvite(organizationId: string) {
  console.log(
    `[handleSuccessfulInvite] Processing for organization: ${organizationId}`,
  );
  const cookieStore = await cookies();
  cookieStore.delete("invite");
  cookieStore.set("organization_id", organizationId);
  console.log(
    `[handleSuccessfulInvite] Cookies updated, redirecting to /hello`,
  );
  return redirect("/hello");
}
