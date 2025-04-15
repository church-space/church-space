import { useInfiniteQuery } from "@tanstack/react-query";
import { getOrganizationMembers } from "@/actions/get-organization-members";
import type { OrganizationMember } from "@/components/tables/organization-members/columns";

interface UsePeopleOptions {
  initialData?: {
    pages: Array<{
      data: OrganizationMember[];
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useOrganizationMembers(
  organizationId: string,
  role?: "owner" | "admin",
  options?: UsePeopleOptions,
) {
  return useInfiniteQuery({
    queryKey: ["organization-members", organizationId, role],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getOrganizationMembers({
        organizationId,
        page: pageParam,
        role,
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
          (result.data.data?.map((person) => ({
            ...person,
          })) as OrganizationMember[]) ?? [],
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
