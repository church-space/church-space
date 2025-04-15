"use server";

import { createClient } from "@church-space/supabase/server";
import { getAllOrganizationMembers } from "@church-space/supabase/queries/all/get-all-organization-members";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getOrganizationMembersSchema = z.object({
  organizationId: z.string(),
});

export const getOrganizationMembers = authActionClient
  .schema(getOrganizationMembersSchema)
  .metadata({
    name: "getOrganizationMembers",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { data, error } = await getAllOrganizationMembers(
      supabase,
      parsedInput.organizationId,
    );

    if (error) throw error;
    if (!data) return { data: [], nextPage: undefined };

    return {
      data: data,
    };
  });
