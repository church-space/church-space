import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getDomainsQuery } from "../all/get-domains";

export const getCachedDomains = async (organizationId: string) => {
  const supabase = await createClient();

  const response = await unstable_cache(
    async () => {
      const response = await getDomainsQuery(supabase, organizationId);
      if (!response.data) return null;
      return response;
    },
    [`domains_${organizationId}`],
    {
      revalidate: 1,
    }
  )();

  if (!response?.data) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`domains_${organizationId}`],
    {
      tags: [`domains_${organizationId}`],
    }
  )();
};
