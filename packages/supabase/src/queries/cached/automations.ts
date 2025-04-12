import "server-only";

import { unstable_cache } from "next/cache";
import {
  getEmailAutomationsByPCOIdQuery,
  TriggerType,
} from "../all/get-email-automation";
import { Client } from "../../types";

export const getCachedEmailAutomationsByPCOId = async (
  pcoListId: string,
  organizationId: string,
  supabase: Client,
  triggerType: TriggerType
) => {
  const response = await unstable_cache(
    async () => {
      const response = await getEmailAutomationsByPCOIdQuery(
        supabase,
        pcoListId,
        organizationId,
        triggerType
      );
      if (!response.data) return null;
      return response;
    },
    [`email_automations_${pcoListId}_${organizationId}_${triggerType}`],
    {
      revalidate: 1,
    }
  )();

  if (!response?.data) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`email_automations_${pcoListId}_${organizationId}_${triggerType}`],
    {
      tags: [`email_automations_${pcoListId}_${organizationId}_${triggerType}`],
    }
  )();
};
