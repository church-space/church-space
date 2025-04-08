export const EMAIL_RECIPIENT_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Delivered", value: "delivered" },
  { label: "Bounced", value: "bounced" },
  { label: "Opened", value: "opened" },
  { label: "Complained", value: "complained" },
  { label: "Pending", value: "pending" },
  { label: "Did Not Send", value: "did-not-send" },
] as const;

export type EmailRecipientStatus =
  (typeof EMAIL_RECIPIENT_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getEmailCategoryFilterConfig = () => {
  return {
    status: {
      type: "select" as const,
      options: EMAIL_RECIPIENT_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "",
    },
  };
};
