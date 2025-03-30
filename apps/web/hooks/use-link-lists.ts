import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getAllLinkLists,
  getLinkListsCount,
} from "@church-space/supabase/queries/all/get-all-link-lists";

const ITEMS_PER_PAGE = 25;

export function useLinkLists(
  organizationId: string,
  searchTerm?: string,
  isPublic?: boolean,
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["link-lists", organizationId, searchTerm, isPublic],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get Link Lists data
      const { data, error } = await getAllLinkLists(supabase, organizationId, {
        start: from,
        end: to,
        searchTerm,
        isPublic,
      });

      if (error) throw error;

      // Get total count
      const { count } = await getLinkListsCount(supabase, organizationId, {
        searchTerm,
        isPublic,
      });

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
