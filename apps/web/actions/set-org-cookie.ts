import { cookies } from "next/headers";

export async function setOrgCookie(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("organizationId", organizationId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
