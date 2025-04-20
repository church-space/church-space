import { useInfiniteQuery } from "@tanstack/react-query";
import { getPeopleWithEmails } from "@/actions/get-people-with-emails";
import type { Person } from "@/components/tables/people/columns";

interface UsePeopleOptions {
  initialData?: {
    pages: Array<{
      data: Person[];
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function usePeople(
  organizationId: string,
  searchTerm?: string,
  emailStatus?: any,
  options?: UsePeopleOptions,
) {
  return useInfiniteQuery({
    queryKey: ["people", organizationId, searchTerm, emailStatus],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getPeopleWithEmails({
        organizationId,
        page: pageParam,
        searchTerm,
        emailStatus,
      });

      if (!result) {
        throw new Error("Failed to fetch emails");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data:
          (result.data.data?.map((person) => {
            // Make sure email_category_unsubscribes is an array
            const email_category_unsubscribes = Array.isArray(
              person.email_category_unsubscribes,
            )
              ? person.email_category_unsubscribes
              : [];

            return {
              ...person,
              email_category_unsubscribes,
            };
          }) as Person[]) ?? [],
        nextPage: result.data.nextPage,
      };
    },

    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    initialData: options?.initialData,
    staleTime: 60000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}
