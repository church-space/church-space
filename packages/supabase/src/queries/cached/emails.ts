import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getEmailQuery } from "../all/get-email";
import { getUserWithDetails } from "./platform";
import { getEmailsQuery, type QueryParams } from "../all/get-emails";

export const getCachedEmail = async (emailId: number) => {
  const supabase = await createClient();

  const user = await getUserWithDetails();

  if (!user) return null;
  if (!user.organizationMembership) return null;

  const response = await unstable_cache(
    async () => {
      const response = await getEmailQuery(supabase, emailId);
      if (!response.data) return null;
      return response;
    },
    [`email_${emailId}_${user.organizationMembership.organization_id}`],
    {
      revalidate: 3600,
    }
  )();

  if (!response?.data) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`email_${emailId}_${user.organizationMembership.organization_id}`],
    {
      tags: [`email_${emailId}_${user.organizationMembership.organization_id}`],
    }
  )();
};

export const getCachedEmails = async (params?: QueryParams) => {
  const supabase = await createClient();
  const user = await getUserWithDetails();

  if (!user) return null;
  if (!user.organizationMembership) return null;

  const organizationId = user.organizationMembership.organization_id;
  const cacheKey = `emails_${organizationId}_${JSON.stringify(params || {})}`;

  return unstable_cache(
    async () => {
      const response = await getEmailsQuery(supabase, organizationId, params);
      if (!response.data) return null;
      return response;
    },
    [cacheKey],
    {
      tags: [`emails_${organizationId}`],
      revalidate: 3600,
    }
  )();
};
