"use server";

import type { ActionResponse } from "@/types/action";
import { createLinkList } from "@church-space/supabase/mutations/link-lists";
import { createClient } from "@church-space/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export interface LinkListResponse {
  id: number;
}

interface LinkList {
  id: number;
  organization_id: string;
  url_slug: string;
  private_name: string;
}

export const createLinkListAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      url_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message:
          "URL slug must be lowercase letters, numbers, and hyphens only",
      }),
      private_name: z.string(),
    }),
  )
  .metadata({
    name: "create-link-list",
  })
  .action(async (parsedInput): Promise<ActionResponse<LinkListResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = (await createLinkList(supabase, {
        organization_id: parsedInput.parsedInput.organization_id,
        url_slug: parsedInput.parsedInput.url_slug,
        private_name: parsedInput.parsedInput.private_name,
        is_public: false,
      })) as { data: LinkList[] | null; error: PostgrestError | null };

      if (error) {
        const pgError = error as PostgrestError;
        // Check for duplicate url_slug error
        if (pgError.code === "23505" && pgError.message?.includes("url_slug")) {
          return {
            success: false,
            error: "This URL is already taken. Please choose another.",
          };
        }
        console.error("Error creating link page:", pgError);
        return {
          success: false,
          error: pgError.message || "Failed to create link page",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from link page creation",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error creating link page:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create link page",
      };
    }
  });
