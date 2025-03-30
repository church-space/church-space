import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getAllEmailTemplates,
  getEmailTemplatesCount,
} from "@church-space/supabase/queries/all/get-all-email-templates";

const ITEMS_PER_PAGE = 25;

export function useEmailTemplates(organizationId: string, searchTerm?: string) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["emails", organizationId, searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get emails data
      const { data, error } = await getAllEmailTemplates(
        supabase,
        organizationId,
        {
          start: from,
          end: to,
          searchTerm,
        },
      );

      if (error) throw error;

      // Get total count
      const { count } = await getEmailTemplatesCount(supabase, organizationId, {
        searchTerm,
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
