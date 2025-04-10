"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getAllEmailAutomations,
  getEmailAutomationsCount,
} from "@church-space/supabase/queries/all/get-all-email-automations";
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

    // Get emails data
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

    // Get total count
    const { count } = await getEmailAutomationsCount(
      supabase,
      parsedInput.organizationId,
      {
        searchTerm: parsedInput.searchTerm,
        isActive: parsedInput.isActive,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
