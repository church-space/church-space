import { useInfiniteQuery } from "@tanstack/react-query";
import { getOrganizationInvites } from "@/actions/get-organization-invites";

export type OrganizationInvite = {
  id: number;
  email: string;
  expires: string;
  status: string;
};

export function useOrganizationInvites(organizationId: string) {
  return useInfiniteQuery({
    queryKey: ["organization-invites", organizationId],
    queryFn: async () => {
      const result = await getOrganizationInvites({
        organizationId,
      });

      if (!result) {
        throw new Error("Failed to fetch invites");
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
          })) as OrganizationInvite[]) ?? [],
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
