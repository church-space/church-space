"use server";

import { getCachedQRCodeClicks } from "@church-space/supabase/queries/cached/qr";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getQRLinkClicksSchema = z.object({
  qrLinkId: z.number(),
  dateFilter: z.object({
    year: z.number(),
    month: z.number().nullable(),
    day: z.number().nullable(),
  }),
});

export const getQRLinkClicksAction = authActionClient
  .schema(getQRLinkClicksSchema)
  .metadata({
    name: "getQRLinkClicks",
  })
  .action(async ({ parsedInput }) => {
    // Get QR link clicks data
    const response = await getCachedQRCodeClicks(
      [parsedInput.qrLinkId.toString()],
      parsedInput.qrLinkId,
      parsedInput.dateFilter,
    );

    if (!response) {
      return {
        data: null,
        error: null,
      };
    }

    const { data, error } = response;

    return {
      data,
      error,
    };
  });
