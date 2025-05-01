import "server-only";

import { getUserQuery } from "@church-space/supabase/get-user";
import { createClient } from "@church-space/supabase/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import ClientPage from "./client-page";
import { redirect } from "next/navigation";
import { processInviteSuccess } from "./actions";

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
    const jwtSecret = process.env.INVITE_MEMBERS_SECRET;
    if (!jwtSecret) {
      console.error("INVITE_MEMBERS_SECRET environment variable is not set");
      // Redirect to client page with inviteError
      return redirect("/onboarding?inviteError=true");
    }

    try {
      const { payload } = await jwtVerify(
        invite.value,
        new TextEncoder().encode(jwtSecret),
      );

      // Verify all required fields are present and of correct type
      if (!payload.exp || typeof payload.exp !== "number") {
        throw new Error("Invalid expiration date in invite token");
      }

      if (
        !payload.organization_id ||
        typeof payload.organization_id !== "string"
      ) {
        throw new Error("Invalid organization ID in invite token");
      }

      if (!payload.role || typeof payload.role !== "string") {
        throw new Error("Invalid role in invite token");
      }

      if (!payload.email || typeof payload.email !== "string") {
        throw new Error("Invalid email in invite token");
      }

      inviteExpires = new Date(payload.exp * 1000);
      organizationId = payload.organization_id;
      role = payload.role;
      emailAddress = payload.email;

      // If the invite has expired, redirect to client page with inviteError
      if (inviteExpires < new Date()) {
        console.log("Invite has expired");
        return redirect("/onboarding?inviteError=true");
      }
    } catch (error) {
      console.error("Error verifying invite:", error);
      // Redirect to client page with inviteError
      return redirect("/onboarding?inviteError=true");
    }

    // Process valid invite with matching user
    if (
      user?.user?.email === emailAddress &&
      user?.user?.id &&
      organizationId &&
      role
    ) {
      const { error } = await supabase.rpc("add_user_to_organization", {
        target_org_id: organizationId,
        target_user_id: user.user.id,
        target_email: emailAddress,
        target_role: role,
      });

      if (error) {
        console.error("Error adding user:", error);
      } else {
        // Handle successful invite in server action
        return processInviteSuccess(organizationId);
      }
    }
  }

  // Default case - render client page
  return <ClientPage />;
}
