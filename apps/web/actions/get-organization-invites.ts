"use server";

import { createClient } from "@church-space/supabase/server";
import { getAllOrganizationInvites } from "@church-space/supabase/queries/all/get-organization-invites";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getOrganizationInvitesSchema = z.object({
  organizationId: z.string(),
});

export const getOrganizationInvites = authActionClient
  .schema(getOrganizationInvitesSchema)
  .metadata({
    name: "getOrganizationInvites",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { data, error } = await getAllOrganizationInvites(
      supabase,
      parsedInput.organizationId,
    );

    if (error) throw error;
    if (!data) return { data: [], nextPage: undefined };

    return {
      data: data,
    };
  });
