import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getUserQuery } from "../all/get-user";

export const getUser = async () => {
  const supabase = createClient();

  return unstable_cache(
    async () => {
      const response = await getUserQuery(supabase);
      if (!response.data.user) return null;
      return response;
    },
    ["user"],
    {
      tags: [`user`],
      revalidate: 1800,
    }
  )();
};
