import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getAllEmailAutomations,
  getEmailAutomationsCount,
} from "@church-space/supabase/queries/all/get-all-email-automations";

const ITEMS_PER_PAGE = 25;

export function useEmailAutomations(
  organizationId: string,
  searchTerm?: string,
  isActive?: boolean,
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["email-automations", organizationId, searchTerm, isActive],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get email automations data
      const { data, error } = await getAllEmailAutomations(
        supabase,
        organizationId,
        {
          start: from,
          end: to,
          searchTerm,
          isActive,
        },
      );

      if (error) throw error;

      // Get total count
      const { count } = await getEmailAutomationsCount(
        supabase,
        organizationId,
        {
          searchTerm,
          isActive,
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
    staleTime: 60000,
    gcTime: 60000,
  });
}
