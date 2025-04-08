import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getAllQrLinks,
  getQrLinksCount,
} from "@church-space/supabase/queries/all/get-all-qr-links";

const ITEMS_PER_PAGE = 25;

export function useQrCodes(
  organizationId: string,
  searchTerm?: string,
  status?: string,
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["qr-codes", organizationId, searchTerm, status],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get QR links data
      const { data, error } = await getAllQrLinks(supabase, organizationId, {
        start: from,
        end: to,
        searchTerm,
        status: status ? [status as any] : undefined,
      });

      if (error) throw error;

      // Get total count
      const { count } = await getQrLinksCount(supabase, organizationId, {
        searchTerm,
        status: status ? [status as any] : undefined,
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
    staleTime: 60000,
    gcTime: 60000,
  });
}
