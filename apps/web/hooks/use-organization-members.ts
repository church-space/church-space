import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getAllOrganizationMembers,
  getOrganizationMembersCount,
} from "@church-space/supabase/queries/all/get-all-organization-members";

const ITEMS_PER_PAGE = 25;

export function useOrganizationMembers(
  organizationId: string,
  role?: "owner" | "admin",
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["organization-members", organizationId, role],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get members data
      const { data, error } = await getAllOrganizationMembers(
        supabase,
        organizationId,
        {
          start: from,
          end: to,
          role,
        },
      );

      if (error) throw error;

      // Get total count
      const { count } = await getOrganizationMembersCount(
        supabase,
        organizationId,
        {
          role,
        },
      );

      const hasNextPage = count ? from + ITEMS_PER_PAGE < count : false;

      return {
        data: data ?? [],
        nextPage: hasNextPage ? pageParam + 1 : undefined,
        count,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}
