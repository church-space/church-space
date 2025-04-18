"use server";

import { createClient } from "@church-space/supabase/server";
import { getDomainQuery } from "@church-space/supabase/queries/all/get-domains";
import { getPcoListQuery } from "@church-space/supabase/queries/all/get-pco-lists";
import { z } from "zod";
import { authActionClient } from "./safe-action";

const getEmailPostSendExtraDataSchema = z.object({
  listId: z.number(),
  fromDomain: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)),
  replyToDomain: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) =>
      typeof val === "string" ? (val === "" ? null : parseInt(val, 10)) : val,
    ),
});

export const getEmailPostSendExtraDataAction = authActionClient
  .schema(getEmailPostSendExtraDataSchema)
  .metadata({
    name: "getEmailPostSendExtraData",
  })
  .action(async ({ parsedInput }) => {
    console.log("parsedInput", parsedInput);
    const supabase = await createClient();

    const { data: listData, error: listError } = await getPcoListQuery(
      supabase,
      parsedInput.listId,
    );

    const { data: domainData, error: domainError } = await getDomainQuery(
      supabase,
      parsedInput.fromDomain,
    );

    let replyToDomainData = null;
    let replyToDomainError = null;

    if (parsedInput.replyToDomain) {
      const result = await getDomainQuery(supabase, parsedInput.replyToDomain);
      replyToDomainData = result.data;
      replyToDomainError = result.error;
    }

    return {
      listData,
      domainData,
      replyToDomainData,
      listError,
      domainError,
      replyToDomainError,
    };
  });
