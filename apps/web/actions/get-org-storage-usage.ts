"use server";

import { createClient } from "@church-space/supabase/server";

import { z } from "zod";
import { authActionClient } from "./safe-action";

const getOrgStorageUsageSchema = z.object({
  organizationId: z.string(),
});

export const getOrgStorageUsageAction = authActionClient
  .schema(getOrgStorageUsageSchema)
  .metadata({
    name: "getOrgStorageUsage",
  })
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("org_storage_used_mb", {
      org_id: parsedInput.organizationId,
    });

    return {
      data,
      error,
    };
  });
