import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getUserQuery } from "../all/get-user";

export const getUser = async () => {
  const supabase = createClient();

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
