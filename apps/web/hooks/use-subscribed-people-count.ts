import { useQuery } from "@tanstack/react-query";
import { getSubscribedPeopleCountAction } from "@/actions/get-subscribed-people-count";

export function useSubscribedPeopleCount(organizationId: string) {
  return useQuery({
    queryKey: ["subscribed-people-count", organizationId],
    queryFn: async () => {
      const result = await getSubscribedPeopleCountAction({
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
        count: result.data.count,
      };
    },

    staleTime: 60000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}
