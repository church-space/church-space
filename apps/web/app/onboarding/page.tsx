import "server-only";

import { getUserQuery } from "@church-space/supabase/get-user";
import { createClient } from "@church-space/supabase/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import ClientPage from "./client-page";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies();
  const invite = cookieStore.get("invite");

  const supabase = await createClient();

  const { data: user, error } = await getUserQuery(supabase);

  if (error) {
    console.error(error);
  }

  let inviteExpires: Date | null = null;
  let organizationId: string | null = null;
  let role: string | null = null;
  let emailAddress: string | null = null;

  if (invite) {
    const verifyInvite = async () => {
      const { payload } = await jwtVerify(
        invite.value,
        new TextEncoder().encode(process.env.INVITE_JWT_SECRET),
      );

      if (!payload.exp) {
        throw new Error("No expiration date found in invite token");
      }

      if (typeof payload.exp !== "number") {
        throw new Error("Expiration date is not a number");
      }

      if (typeof payload.organization_id !== "string") {
        throw new Error("Organization ID is not a string");
      }

      if (typeof payload.role !== "string") {
        throw new Error("Role is not a string");
      }

      if (typeof payload.email !== "string") {
        throw new Error("Email is not a string");
      }

      inviteExpires = new Date(payload.exp * 1000);
      organizationId = payload.organization_id;
      role = payload.role;
      emailAddress = payload.email;

      // If the invite has expired, remove it
      if (inviteExpires && inviteExpires < new Date()) {
        cookieStore.delete("invite");
      }
      window.location.reload();
    };

    verifyInvite();
  }

  if (
    user?.user?.email === emailAddress &&
    user?.user?.id &&
    organizationId &&
    role
  ) {
    const { error } = await supabase.rpc("add_user_to_organization", {
      target_org_id: organizationId,
      target_user_id: user.user.id,
      target_role: role,
    });

    if (error) {
      console.error("Error adding user:", error);
    } else {
      cookieStore.delete("invite");
      cookieStore.set("organization_id", organizationId);
      return redirect(`/emails?invite-accepted=true`);
    }
  }

  return <ClientPage />;
}
