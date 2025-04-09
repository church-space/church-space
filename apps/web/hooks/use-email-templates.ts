import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmailTemplates } from "../actions/get-email-templates";
import type { EmailTemplate } from "@/components/tables/email-templates/columns";

interface UseEmailTemplatesOptions {
  initialData?: {
    pages: Array<{
      data: EmailTemplate[];
      count: number;
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useEmailTemplates(
  organizationId: string,
  searchTerm?: string,
  options?: UseEmailTemplatesOptions,
) {
  return useInfiniteQuery({
    queryKey: ["email-templates", organizationId, searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getEmailTemplates({
        organizationId,
        page: pageParam,
        searchTerm,
      });

      if (!result) {
        throw new Error("Failed to fetch email templates");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data: result.data.data ?? [],
        count: result.data.count ?? 0,
        nextPage: result.data.nextPage,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: 0,
    initialData: options?.initialData,
    staleTime: 60000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}
