export const EMAIL_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Subscribed", value: "subscribed" },
  { label: "Partially Subscribed", value: "partially subscribed" },
  { label: "Unsubscribed", value: "unsubscribed" },
  { label: "PCO Blocked", value: "pco_blocked" },
] as const;

export type EmailStatus = (typeof EMAIL_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getPeopleFilterConfig = () => {
  return {
    emailStatus: {
      type: "select" as const,
      options: [...EMAIL_STATUS_OPTIONS],
      defaultValue: "all",
    },
  };
};

// Helper function to convert UI emailStatus to database query parameters
export const convertEmailStatusToQueryParams = (
  emailStatus?: string,
): ("subscribed" | "unsubscribed" | "pco_blocked")[] | undefined => {
  if (!emailStatus || emailStatus === "all") {
    return undefined;
  }

  // For "partially subscribed", we need to query for "subscribed" status
  // and then filter in the application code
  if (emailStatus === "partially subscribed") {
    return ["subscribed"];
  }

  // For other statuses, we can directly use them
  if (
    emailStatus === "subscribed" ||
    emailStatus === "unsubscribed" ||
    emailStatus === "pco_blocked"
  ) {
    return [emailStatus];
  }

  // Default case, should not happen
  return undefined;
};
