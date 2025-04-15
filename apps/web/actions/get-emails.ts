"use server";

import { createClient } from "@church-space/supabase/server";
import { getEmailsQuery } from "@church-space/supabase/queries/all/get-emails";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getEmailsSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
  status: z.string().optional(),
});

export const getEmails = authActionClient
  .schema(getEmailsSchema)
  .metadata({
    name: "getEmails",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data with one extra item to determine if there's a next page
    const { data, error } = await getEmailsQuery(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
        status: parsedInput.status as any,
        type: ["standard"],
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
