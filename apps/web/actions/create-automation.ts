"use server";

import type { ActionResponse } from "@/types/action";
import { createAutomation } from "@church-space/supabase/mutations/automations";
import { createClient } from "@church-space/supabase/server";

import { z } from "zod";
import { authActionClient } from "./safe-action";

export interface AutomationResponse {
  id: number;
}

interface Automation {
  id: number;
  organization_id: string;
  name: string;
  description: string;
}

export const createAutomationAction = authActionClient
  .schema(
    z.object({
      organization_id: z.string(),
      name: z.string(),
      description: z.string(),
    }),
  )
  .metadata({
    name: "create-automation",
  })
  .action(async (parsedInput): Promise<ActionResponse<AutomationResponse>> => {
    try {
      const supabase = await createClient();

      const { data, error } = (await createAutomation(supabase, {
        organization_id: parsedInput.parsedInput.organization_id,
        name: parsedInput.parsedInput.name,
        description: parsedInput.parsedInput.description,
      })) as { data: Automation[] | null; error: any | null };

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to create automation",
        };
      }

      if (!data || !data[0]) {
        return {
          success: false,
          error: "No data returned from automation creation",
        };
      }

      return {
        success: true,
        data: { id: data[0].id },
      };
    } catch (error) {
      console.error("Error creating automation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create automation",
      };
    }
  });
