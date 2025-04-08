"use server";

import { createClient } from "@church-space/supabase/server";
import {
  getEmailRecipientsQuery,
  getEmailRecipientsCount,
} from "@church-space/supabase/queries/all/get-email-recipients";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const ITEMS_PER_PAGE = 25;

const getEmailRecipientsSchema = z.object({
  emailId: z.number(),
  page: z.number().default(0),
  emailAddress: z.string().optional(),
  recipientStatus: z.string().optional(),
});

export const getEmailRecipientsAction = authActionClient
  .schema(getEmailRecipientsSchema)
  .metadata({
    name: "getEmailRecipients",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const from = parsedInput.page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Get emails data
    const { data, error } = await getEmailRecipientsQuery(
      supabase,
      parsedInput.emailId,
      {
        start: from,
        end: to,
        emailAddress: parsedInput.emailAddress,
        recipientStatus: parsedInput.recipientStatus as any,
      },
    );

    if (error) throw error;

    // Get total count
    const { count } = await getEmailRecipientsCount(
      supabase,
      parsedInput.emailId,
      {
        emailAddress: parsedInput.emailAddress,
        recipientStatus: parsedInput.recipientStatus as any,
      },
    );

    const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

    return {
      data: data ?? [],
      nextPage: hasNextPage ? parsedInput.page + 1 : undefined,
      count,
    };
  });
