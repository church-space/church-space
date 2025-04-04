"use server";

import type { ActionResponse } from "@/types/action";
import { createClient } from "@church-space/supabase/server";
import { createClient as createJobClient } from "@church-space/supabase/job";
import { z } from "zod";
import { authActionClient } from "./safe-action";
import { getOrgOwnersQuery } from "@church-space/supabase/queries/all/get-org-owners";

export const deleteUserAction = authActionClient
  .schema(
    z.object({
      userId: z.string(),
      email: z.string().email(),
      organizationId: z.string(),
      organizationName: z.string().optional(),
      role: z.enum(["owner", "admin"]),
    }),
  )
  .metadata({
    name: "delete-user",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const jobClient = await createJobClient();
      const { userId, email, organizationId, organizationName, role } =
        parsedInput.parsedInput;

      // Get the current user's email to verify
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: "Failed to fetch user data",
        };
      }

      // Verify email matches
      if (userData.email !== email) {
        return {
          success: false,
          error: "Email does not match your account",
        };
      }

      // If user is an owner, check if they're the only owner
      if (role === "owner") {
        const { data: ownersData, error: ownersError } =
          await getOrgOwnersQuery(supabase, organizationId);

        if (ownersError || !ownersData) {
          return {
            success: false,
            error: "Failed to fetch organization owners",
          };
        }

        // If they're the only owner, verify organization name
        if (ownersData.length === 1) {
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

          // Delete the organization first (this will cascade delete memberships)
          const { error: deleteOrgError } = await supabase
            .from("organizations")
            .delete()
            .eq("id", organizationId);

          if (deleteOrgError) {
            return {
              success: false,
              error: "Failed to delete organization",
            };
          }
        }
      }

      // Delete from auth first
      console.log("Deleting user from auth...");
      const { error: deleteAuthError } =
        await jobClient.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error("Auth deletion error details:", {
          message: deleteAuthError.message,
          name: deleteAuthError.name,
          status: deleteAuthError.status,
        });
        return {
          success: false,
          error: `Failed to delete user from auth: ${deleteAuthError.message}`,
        };
      }

      // Then delete any remaining database records
      // Delete organization memberships first
      const { error: deleteMembershipError } = await supabase
        .from("organization_memberships")
        .delete()
        .eq("user_id", userId);

      if (deleteMembershipError) {
        console.error(
          "Error deleting organization memberships:",
          deleteMembershipError,
        );
        return {
          success: false,
          error: `Failed to delete organization memberships: ${deleteMembershipError.message}`,
        };
      }

      // Finally delete user record
      const { error: deleteUserError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteUserError) {
        console.error("Error deleting user from database:", deleteUserError);
        return {
          success: false,
          error: `Failed to delete user from database: ${deleteUserError.message}`,
        };
      }

      return {
        success: true,
        data: { message: "User deleted successfully" },
      };
    } catch (error) {
      console.error("Error deleting user:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete user due to an unknown error";

      return {
        success: false,
        error: `Failed to delete user: ${errorMessage}`,
      };
    }
  });
