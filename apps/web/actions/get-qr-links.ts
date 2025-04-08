"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getAllQrLinks,
  getQrLinksCount,
} from "@church-space/supabase/queries/all/get-all-qr-links";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getQrLinksSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
  status: z.string().optional(),
});

export const getQrLinks = authActionClient
  .schema(getQrLinksSchema)
  .metadata({
    name: "getQrLinks",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data
    const { data, error } = await getAllQrLinks(
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
    const { count } = await getQrLinksCount(
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
