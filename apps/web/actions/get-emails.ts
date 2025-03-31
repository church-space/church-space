"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getEmailsQuery,
  getEmailsCount,
} from "@church-space/supabase/queries/all/get-emails";
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

    // Get emails data
    const { data, error } = await getEmailsQuery(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
        status: parsedInput.status as any,
      },
    );

    if (error) throw error;

    // Get total count
    const { count } = await getEmailsCount(
      supabase,
      parsedInput.organizationId,
      {
        searchTerm: parsedInput.searchTerm,
        status: parsedInput.status as any,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
