export const EMAIL_TYPE_OPTIONS = [
  { label: "Standard", value: "standard" },
  { label: "Template", value: "template" },
] as const;

export type EmailType = (typeof EMAIL_TYPE_OPTIONS)[number]["value"];
