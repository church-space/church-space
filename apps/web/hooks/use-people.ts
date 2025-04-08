import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";
import {
  getPeopleWithEmailsAndSubscriptionStatus,
  getPeopleCount,
} from "@church-space/supabase/queries/all/get-people-with-emails";
import { convertEmailStatusToQueryParams } from "@/components/tables/people/filters";

const ITEMS_PER_PAGE = 25;

export function usePeople(
  organizationId: string,
  searchTerm?: string,
  emailStatus?: string,
) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["people", organizationId, searchTerm, emailStatus],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Convert UI emailStatus to database query parameters
      const emailStatusParams = convertEmailStatusToQueryParams(emailStatus);

      // Get people data
      const { data, error } = await getPeopleWithEmailsAndSubscriptionStatus(
        supabase,
        organizationId,
        {
          start: from,
          end: to,
          searchTerm,
          ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
        },
      );

      if (error) throw error;

      // Get total count
      const { count } = await getPeopleCount(supabase, organizationId, {
        searchTerm,
        ...(emailStatusParams ? { emailStatus: emailStatusParams } : {}),
      });

      // If we're filtering by "partially subscribed", we need to filter the results
      let filteredData = data ?? [];
      if (emailStatus === "partially subscribed") {
        filteredData = filteredData.filter((person) => {
          const firstEmail = person.people_emails?.[0];
          return (
            firstEmail?.status === "subscribed" &&
            person.email_list_category_unsubscribes?.length > 0
          );
        });
      }

      const hasNextPage =
        emailStatus === "partially subscribed"
          ? false // No pagination for filtered results
          : count
            ? from + ITEMS_PER_PAGE < count
            : false;

      return {
        data: filteredData,
        nextPage: hasNextPage ? pageParam + 1 : undefined,
        count:
          emailStatus === "partially subscribed" ? filteredData.length : count,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 60000,
    gcTime: 60000,
  });
}
