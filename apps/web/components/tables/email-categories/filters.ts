export const EMAIL_CATEGORY_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Public", value: "true" },
  { label: "Private", value: "false" },
] as const;

export type EmailCategoryStatus =
  (typeof EMAIL_CATEGORY_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getEmailCategoryFilterConfig = () => {
  return {
    is_public: {
      type: "select" as const,
      options: EMAIL_CATEGORY_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "all",
      label: "Visibility",
    },
  };
};
