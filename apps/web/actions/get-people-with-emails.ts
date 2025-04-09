"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getPeopleWithEmailsAndSubscriptionStatus,
  getPeopleCount,
} from "@church-space/supabase/queries/all/get-people-with-emails";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getPeopleWithEmailsSchema = z.object({
  organizationId: z.string(),
  page: z.number().default(0),
  searchTerm: z.string().optional(),
  emailStatus: z
    .enum([
      "subscribed",
      "partially subscribed",
      "pco_blocked",
      "unsubscribed",
      "cleaned",
    ])
    .optional(),
});

export const getPeopleWithEmails = authActionClient
  .schema(getPeopleWithEmailsSchema)
  .metadata({
    name: "getPeopleWithEmails",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data
    const { data, error } = await getPeopleWithEmailsAndSubscriptionStatus(
      supabase,
      parsedInput.organizationId,
      {
        start: from,
        end: to,
        searchTerm: parsedInput.searchTerm,
        emailStatus: parsedInput.emailStatus as any,
      },
    );

    if (error) throw error;

    // Get total count
    const { count } = await getPeopleCount(
      supabase,
      parsedInput.organizationId,
      {
        searchTerm: parsedInput.searchTerm,
        emailStatus: parsedInput.emailStatus as any,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
