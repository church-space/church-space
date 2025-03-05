import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import {
  getPeopleWithEmailsAndSubscriptionStatus,
  getPeopleCount,
  type QueryParams,
} from "../all/get-people-with-emails";
import { getUserWithDetails } from "./platform";

export const getCachedPeopleWithEmails = async (params?: QueryParams) => {
  const supabase = await createClient();
  const user = await getUserWithDetails();

  if (!user) return null;
  if (!user.organizationMembership) return null;

  const organizationId = user.organizationMembership.organization_id;
  const cacheKey = `people_${organizationId}_${JSON.stringify(params || {})}`;

  const response = await unstable_cache(
    async () => {
      const response = await getPeopleWithEmailsAndSubscriptionStatus(
        supabase,
        organizationId,
        params
      );
      if (!response.data) return null;
      return response;
    },
    [cacheKey],
    {
      revalidate: 1,
    }
  )();

  if (!response) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [cacheKey],
    {
      tags: [`people_${organizationId}`],
      revalidate: 1,
    }
  )();
};

export const getCachedPeopleCount = async (
  params?: QueryParams
): Promise<{ count: number | null; error: any } | null> => {
  const supabase = await createClient();
  const user = await getUserWithDetails();

  if (!user) return null;
  if (!user.organizationMembership) return null;

  const organizationId = user.organizationMembership.organization_id;
  const cacheKey = `people_count_${organizationId}_${JSON.stringify(params || {})}`;

  return unstable_cache(
    async () => {
      const response = await getPeopleCount(supabase, organizationId, params);
      return response;
    },
    [cacheKey],
    {
      tags: [`people_count_${organizationId}`],
      revalidate: 1,
    }
  )();
};
