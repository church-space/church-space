import { useInfiniteQuery } from "@tanstack/react-query";
import { getOrganizationMembers } from "@/actions/get-organization-members";
import type { OrganizationMember } from "@/components/tables/organization-members/columns";

export function useOrganizationMembers(organizationId: string) {
  return useInfiniteQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      const result = await getOrganizationMembers({
        organizationId,
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
    staleTime: 60000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}
