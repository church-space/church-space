import "server-only";

import { getUserQuery } from "@church-space/supabase/get-user";
import { createClient } from "@church-space/supabase/server";
import { jwtVerify } from "jose";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientPage from "./client-page";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default async function Page() {
  const cookieStore = await cookies();
  const invite = cookieStore.get("invite");

  const supabase = await createClient();

  const { data: user, error } = await getUserQuery(supabase);

  if (error) {
    console.error("[Onboarding Page] Error getting user:", error);
  }

  let inviteExpires: Date | null = null;
  let organizationId: string | null = null;
  let role: string | null = null;
  let emailAddress: string | null = null;
  let validInvite = false;

  if (invite) {
    const jwtSecret = process.env.INVITE_MEMBERS_SECRET;
    if (!jwtSecret) {
      console.error(
        "[Onboarding Page] INVITE_MEMBERS_SECRET environment variable is not set",
      );
      // Continue without the invite - client side will clean up expired invite cookie
      return <ClientPage inviteErrorParam={true} />;
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

      // If the invite has expired, just continue without it
      if (inviteExpires < new Date()) {
        return <ClientPage inviteErrorParam={true} />;
      }

      validInvite = true;
    } catch (error: any) {
      // For JWT expiration errors, just log once and continue without the invite
      if (error.code === "ERR_JWT_EXPIRED") {
        console.log("[Onboarding Page] Invite token expired");
      } else {
        console.error("[Onboarding Page] Error verifying invite:", error);
      }

      // Continue without the invite - client side will clean up expired invite cookie
      return <ClientPage inviteErrorParam={true} />;
    }

    // Process valid invite with matching user
    if (
      validInvite &&
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
        console.error("[Onboarding Page] Error adding user:", error);
      } else {
        // Handle successful invite using server action to redirect with orgId
        // Cookie handling will happen on the /hello page
        redirect(`/hello`);
      }
    } else if (validInvite) {
      console.log(
        "[Onboarding Page] User email doesn't match invite email or missing required data",
        {
          userEmail: user?.user?.email,
          inviteEmail: emailAddress,
          hasUserId: !!user?.user?.id,
          hasOrgId: !!organizationId,
          hasRole: !!role,
        },
      );
    }
  }

  return <ClientPage />;
}
