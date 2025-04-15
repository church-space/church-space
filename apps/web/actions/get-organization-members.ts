"use server";

import { createClient } from "@church-space/supabase/server";
import { getAllOrganizationMembers } from "@church-space/supabase/queries/all/get-all-organization-members";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getOrganizationMembersSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  role: z.enum(["owner", "admin"]).optional(),
});

export const getOrganizationMembers = authActionClient
  .schema(getOrganizationMembersSchema)
  .metadata({
    name: "getOrganizationMembers",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await getAllOrganizationMembers(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        role: parsedInput.role,
      },
    );

    if (error) throw error;
    if (!data) return { data: [], nextPage: undefined };

    // If we got more items than ITEMS_PER_PAGE, there's a next page
    const hasNextPage = data.length > ITEMS_PER_PAGE;

    // Remove the extra item before sending to client
    const items = hasNextPage ? data.slice(0, -1) : data;

    return {
      data: items,
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
    };
  });
