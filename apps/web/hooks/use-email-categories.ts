import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmailCategories } from "@/actions/get-all-email-categories";
import type { EmailCategory } from "@/components/tables/email-categories/columns";

interface UseEmailCategoriesOptions {
  initialData?: {
    pages: Array<{
      data: EmailCategory[];
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useEmailCategories(
  organizationId: string,
  searchTerm?: string,
  isPublic?: boolean,
  options?: UseEmailCategoriesOptions,
) {
  return useInfiniteQuery({
    queryKey: ["email-categories", organizationId, searchTerm, isPublic],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getEmailCategories({
        organizationId,
        page: pageParam,
        searchTerm,
        isPublic,
      });

      if (!result) {
        throw new Error("Failed to fetch email categories");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data: result.data.data ?? [],
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
