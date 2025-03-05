export const EMAIL_STATUS_OPTIONS = [
  { label: "Subscribed", value: "subscribed" },
  { label: "Partially Subscribed", value: "partially subscribed" },
  { label: "Unsubscribed", value: "unsubscribed" },
  { label: "PCO Blocked", value: "pco_blocked" },
] as const;

export type EmailStatus = (typeof EMAIL_STATUS_OPTIONS)[number]["value"];
