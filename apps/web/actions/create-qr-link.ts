"use server";

import type { ActionResponse } from "@/types/action";
import { createQRLink } from "@church-space/supabase/mutations/qr-codes";
import { createClient } from "@church-space/supabase/server";

import { z } from "zod";
import { authActionClient } from "./safe-action";

export interface QRLinkResponse {
  id: number;
}

interface QRLink {
  id: number;
  organization_id: string;
  url: string;
  name: string;
}

export const createQRLinkAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      url: z.string(),
      name: z.string(),
    }),
  )
  .metadata({
    name: "create-qr-link",
  })
  .action(async (parsedInput): Promise<ActionResponse<QRLinkResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = (await createQRLink(supabase, {
        organization_id: parsedInput.parsedInput.organization_id,
        url: parsedInput.parsedInput.url,
        name: parsedInput.parsedInput.name,
      })) as { data: QRLink[] | null; error: any | null };

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to create QR link",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from QR link creation",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error creating QR link:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create QR link",
      };
    }
  });
