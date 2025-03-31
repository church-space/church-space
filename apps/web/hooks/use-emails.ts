import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmails } from "../actions/get-emails";
import type { Email } from "@/components/tables/emails/columns";

interface UseEmailsOptions {
  initialData?: {
    pages: Array<{
      data: Email[];
      count: number;
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useEmails(
  organizationId: string,
  searchTerm?: string,
  status?: string,
  options?: UseEmailsOptions,
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

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data:
          (result.data.data?.map((email) => ({
            ...email,
            from_domain: email.from_domain as unknown as {
              domain: string;
            } | null,
            reply_to_domain: email.reply_to_domain as unknown as {
              domain: string;
            } | null,
          })) as Email[]) ?? [],
        count: result.data.count ?? 0,
        nextPage: result.data.nextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: 0,
    initialData: options?.initialData,
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache the data
  });
}
