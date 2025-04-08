"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getAllLinkLists,
  getLinkListsCount,
} from "@church-space/supabase/queries/all/get-all-link-lists";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getLinkListsSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const getLinkLists = authActionClient
  .schema(getLinkListsSchema)
  .metadata({
    name: "getLinkLists",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data
    const { data, error } = await getAllLinkLists(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
        isPublic: parsedInput.isPublic,
      },
    );

    if (error) throw error;

    // Get total count
    const { count } = await getLinkListsCount(
      supabase,
      parsedInput.organizationId,
      {
        searchTerm: parsedInput.searchTerm,
        isPublic: parsedInput.isPublic,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
