import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmails } from "../actions/get-emails";

export function useEmails(
  organizationId: string,
  searchTerm?: string,
  status?: string,
) {
  return useInfiniteQuery({
    queryKey: ["emails", organizationId, searchTerm, status],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getEmails({
        organizationId,
        page: pageParam,
        searchTerm,
        status,
      });

      if (!result) {
        throw new Error("Failed to fetch emails");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: 0,
  });
}
