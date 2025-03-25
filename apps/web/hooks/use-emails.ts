import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getEmailsQuery,
  getEmailsCount,
} from "@church-space/supabase/queries/all/get-emails";

const ITEMS_PER_PAGE = 25;

export function useEmails(
  organizationId: string,
  searchTerm?: string,
  status?: string,
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["emails", organizationId, searchTerm, status],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get emails data
      const { data, error } = await getEmailsQuery(supabase, organizationId, {
        start: from,
        end: to,
        searchTerm,
        status: status as any,
      });

      if (error) throw error;

      // Get total count
      const { count } = await getEmailsCount(supabase, organizationId, {
        searchTerm,
        status: status as any,
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
