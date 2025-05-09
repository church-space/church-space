import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getEmailAutomationMembers,
  getEmailAutomationMembersCount,
} from "@church-space/supabase/queries/all/get-all-email-automation-members";

const ITEMS_PER_PAGE = 25;

export function useEmailAutomationMembers(automationId: number, step?: number) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["email-automation-members", automationId, step],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get email automation members data
      const { data, error } = await getEmailAutomationMembers(
        supabase,
        automationId,
        {
          step: step,
        },
      );

      if (error) throw error;

      // Get total count
      const { count } = await getEmailAutomationMembersCount(
        supabase,
        automationId,
        {
          step: step,
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
