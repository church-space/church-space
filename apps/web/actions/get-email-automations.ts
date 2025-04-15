"use server";

import { createClient } from "@church-space/supabase/server";
import { getAllEmailAutomations } from "@church-space/supabase/queries/all/get-all-email-automations";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getEmailAutomationsSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getEmailAutomations = authActionClient
  .schema(getEmailAutomationsSchema)
  .metadata({
    name: "getEmailAutomations",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await getAllEmailAutomations(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
        isActive: parsedInput.isActive,
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
