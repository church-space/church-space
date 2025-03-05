export const EMAIL_TYPE_OPTIONS = [
  { label: "Standard", value: "standard" },
  { label: "Template", value: "template" },
] as const;

export type EmailType = (typeof EMAIL_TYPE_OPTIONS)[number]["value"];

export const EMAIL_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sent", value: "sent" },
  { label: "Sending", value: "sending" },
  { label: "Draft", value: "draft" },
  { label: "Failed", value: "failed" },
] as const;

export type EmailStatus = (typeof EMAIL_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getEmailFilterConfig = () => {
  return {
    status: {
      type: "select" as const,
      options: [...EMAIL_STATUS_OPTIONS],
      defaultValue: "all",
    },
  };
};
