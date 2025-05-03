import { useInfiniteQuery } from "@tanstack/react-query";
import { getEmailRecipientsAction } from "../actions/get-email-recipients";

interface EmailRecipient {
  id: number;
  email_address: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  unsubscribed: boolean;
  clicked: boolean;
}

interface UseEmailRecipientsOptions {
  initialData?: {
    pages: Array<{
      data: EmailRecipient[];
      count: number;
      nextPage: number | undefined;
    }>;
    pageParams: number[];
  };
}

export function useEmailRecipients(
  emailId: number,
  emailAddress?: string,
  recipientStatus?: string,
  options?: UseEmailRecipientsOptions,
) {
  return useInfiniteQuery({
    queryKey: ["email-recipients", emailId, emailAddress, recipientStatus],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getEmailRecipientsAction({
        emailId,
        page: pageParam,
        emailAddress,
        recipientStatus,
      });

      if (!result) {
        throw new Error("Failed to fetch email recipients");
      }

      if (result.validationErrors) {
        throw new Error(Object.values(result.validationErrors).join(", "));
      }

      if (!result.data) {
        throw new Error("No data returned from server");
      }

      return {
        data:
          result.data.data?.map((emailRecipient) => ({
            id: emailRecipient.id,
            email_address: emailRecipient.email_address,
            status: emailRecipient.status,
            created_at: emailRecipient.created_at,
            updated_at: emailRecipient.updated_at,
            first_name: emailRecipient.first_name,
            last_name: emailRecipient.last_name,
            unsubscribed: emailRecipient.unsubscribed,
            clicked: emailRecipient.clicked,
          })) ?? [],
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
    refetchOnReconnect: false,
  });
}
