import { useInfiniteQuery } from "@tanstack/react-query";
import { getLinkLists } from "@/actions/get-link-lists";
import type { LinkList } from "@/components/tables/link-lists/columns";

interface UseLinkListsOptions {
  initialData?: {
    pages: Array<{
      data: LinkList[];
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useLinkLists(
  organizationId: string,
  searchTerm?: string,
  isPublic?: boolean,
  options?: UseLinkListsOptions,
) {
  return useInfiniteQuery({
    queryKey: ["link-lists", organizationId, searchTerm, isPublic],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getLinkLists({
        organizationId,
        page: pageParam,
        searchTerm,
        isPublic,
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
          (result.data.data?.map((linkList) => ({
            ...linkList,
          })) as LinkList[]) ?? [],
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
