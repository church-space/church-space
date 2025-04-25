"use server";

import type { ActionResponse } from "@/types/action";
import { createClient } from "@church-space/supabase/server";
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
      role: z.enum(["owner", "admin", "member"]),
    }),
  )
  .metadata({
    name: "delete-user",
  })
  .action(async (parsedInput): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
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

          // Call the delete organization API endpoint
          const response = await fetch(
            "https://churchspace.co/api/organization/delete-organization",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
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

          // Since the organization deletion was successful and it will cascade delete memberships,
          // we can proceed directly to deleting the user from auth
        }
      }

      // Call the delete organization API endpoint
      const response = await fetch(
        "https://churchspace.co/api/user/delete-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            deleteUserToken: process.env.DELETE_USER_SECRET,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Failed to delete user: ${errorData.error || response.statusText}`,
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
