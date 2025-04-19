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
    // The key **must** match the accessorKey used in columns.tsx ("is_active")
    // so that DataTable can correctly associate the filter with the column.
    is_active: {
      type: "select" as const,
      options: AUTOMATION_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "all",
      label: "Status",
    },
  };
};
