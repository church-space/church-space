"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getAllEmailTemplates,
  getEmailTemplatesCount,
} from "@church-space/supabase/queries/all/get-all-email-templates";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getEmailTemplatesSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
});

export const getEmailTemplates = authActionClient
  .schema(getEmailTemplatesSchema)
  .metadata({
    name: "getEmailTemplates",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data
    const { data, error } = await getAllEmailTemplates(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
      },
    );

    if (error) throw error;

    // Get total count
    const { count } = await getEmailTemplatesCount(
      supabase,
      parsedInput.organizationId,
      {
        searchTerm: parsedInput.searchTerm,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
