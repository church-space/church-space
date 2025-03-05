import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getUserQuery } from "../all/get-user";
import { getUserWithDetailsQuery } from "../all/get-user-with-details";

export const getUser = async () => {
  const supabase = await createClient();

  const response = await unstable_cache(
    async () => {
      const response = await getUserQuery(supabase);
      if (!response.data.user) return null;
      return response;
    },
    ["user"],
    {
      revalidate: 3600,
    }
  )();

  if (!response?.data.user) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`user_${response.data.user.id}`],
    {
      tags: [`user_${response.data.user.id}`],
    }
  )();
};

export const getUserWithDetails = async () => {
  const supabase = await createClient();

  const response = await unstable_cache(
    async () => {
      const response = await getUserWithDetailsQuery(supabase);
      if (!response?.user) return null;
      return response;
    },
    ["user_with_details"],
    {
      revalidate: 3600,
    }
  )();

  if (!response?.user) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`user_with_details_${response.user.id}`],
    {
      tags: [`user_with_details_${response.user.id}`],
    }
  )();
};
