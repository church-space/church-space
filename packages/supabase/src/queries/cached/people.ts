import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getPeopleWithEmailsAndSubscriptionStatus } from "../all/get-people-with-emails";
import { getUserWithDetails } from "./platform";

export const getCachedPeopleWithEmails = async () => {
  const supabase = await createClient();

  const user = await getUserWithDetails();

  if (!user) return null;
  if (!user.organizationMembership) return null;

  const response = await unstable_cache(
    async () => {
      const response = await getPeopleWithEmailsAndSubscriptionStatus(
        supabase,
        user.organizationMembership.organization_id
      );
      if (!response.data) return null;
      return response;
    },
    [`people_${user.organizationMembership.organization_id}`],
    {
      revalidate: 1,
    }
  )();

  if (!response?.data) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`people_${user.organizationMembership.organization_id}`],
    {
      tags: [`people_${user.organizationMembership.organization_id}`],
      revalidate: 1,
    }
  )();
};
