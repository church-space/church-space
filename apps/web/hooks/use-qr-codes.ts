import { useInfiniteQuery } from "@tanstack/react-query";
import { getQrLinks } from "../actions/get-qr-links";
import { QrLink } from "@/components/tables/qr-codes/columns";

interface UseQrLinksOptions {
  initialData?: {
    pages: Array<{
      data: QrLink[];
      count: number;
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useQrLinks(
  organizationId: string,
  searchTerm?: string,
  status?: string,
  options?: UseQrLinksOptions,
) {
  return useInfiniteQuery({
    queryKey: ["qr-links", organizationId, searchTerm, status],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getQrLinks({
        organizationId,
        page: pageParam,
        searchTerm,
        status,
      });

      if (!result) {
        throw new Error("Failed to fetch QR links");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data:
          (result.data.data?.map((qrLink) => ({
            ...qrLink,
          })) as QrLink[]) ?? [],
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
