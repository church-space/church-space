import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmailAutomations } from "@/actions/get-email-automations";
import type { EmailAutomation } from "@/components/tables/automations/columns";

interface UseEmailAutomationsOptions {
  initialData?: {
    pages: Array<{
      data: EmailAutomation[];
      count: number;
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useEmailAutomations(
  organizationId: string,
  searchTerm?: string,
  isActive?: boolean,
  options?: UseEmailAutomationsOptions,
) {
  return useInfiniteQuery({
    queryKey: ["email-automations", organizationId, searchTerm, isActive],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getEmailAutomations({
        organizationId,
        page: pageParam,
        searchTerm,
        isActive,
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
          (result.data.data?.map((emailAutomation) => ({
            ...emailAutomation,
          })) as EmailAutomation[]) ?? [],
        count: result.data.count ?? 0,
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
