export const AUTOMATION_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
] as const;

export type AutomationStatus =
  (typeof AUTOMATION_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getAutomationFilterConfig = () => {
  return {
    isActive: {
      type: "select" as const,
      options: AUTOMATION_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "",
    },
  };
};
