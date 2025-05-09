"use server";

import type { ActionResponse } from "@/types/action";
import { createClient } from "@church-space/supabase/server";
import { z } from "zod";
import { authActionClient } from "./safe-action";
import { getOrgOwnersQuery } from "@church-space/supabase/queries/all/get-org-owners";
import { getUserQuery } from "@church-space/supabase/get-user";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const deleteOrganizationAction = authActionClient
  .schema(
    z.object({
      organizationId: z.string(),
      organizationName: z.string().optional(),
    }),
  )
  .metadata({
    name: "delete-organization",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const cookieStore = await cookies();

      const supabase = await createClient();
      const { organizationId, organizationName } = parsedInput.parsedInput;

      const { data: userData, error: userError } = await getUserQuery(supabase);

      if (userError || !userData) {
        return {
          success: false,
          error: "Failed to fetch user data",
        };
      }

      const { data: ownersData, error: ownersError } = await getOrgOwnersQuery(
        supabase,
        organizationId,
      );

      if (ownersError || !ownersData) {
        return {
          success: false,
          error: "Failed to fetch organization owners",
        };
      }

      // Check if the current user is an owner
      const isOwner = ownersData.some(
        (owner) => owner.user_id === userData.user?.id,
      );

      if (!isOwner) {
        return {
          success: false,
          error: "Only organization owners can delete the organization",
        };
      }

      // Verify organization name for any owner attempting to delete
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .single();

      if (orgError || !orgData) {
        return {
          success: false,
          error: "Failed to fetch organization data",
        };
      }

      if (!organizationName || orgData.name !== organizationName) {
        return {
          success: false,
          error: "Organization name does not match",
        };
      }

      // Call the delete organization API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/organization/delete-organization`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieStore
              .getAll()
              .map((cookie) => `${cookie.name}=${cookie.value}`)
              .join("; "),
          },
          body: JSON.stringify({
            organizationId,
            deleteOrganizationToken: process.env.DELETE_ORGANIZATION_SECRET,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Failed to delete organization: ${errorData.error || response.statusText}`,
        };
      }

      // Only proceed with logout after successful API response
      cookieStore.delete("planning_center_session");
      cookieStore.delete("organizationId");
      cookieStore.delete("sidebar_state");

      await supabase.auth.signOut({
        scope: "global",
      });

      return redirect("/homepage");
    } catch (error) {
      console.error("Error deleting organization:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete organization due to an unknown error";

      return {
        success: false,
        error: `Failed to delete organization: ${errorMessage}`,
      };
    }
  });
