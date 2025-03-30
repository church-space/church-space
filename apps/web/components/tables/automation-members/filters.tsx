export const STEP_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Waiting", value: "waiting" },
  { label: "Completed", value: "completed" },
] as const;

export type StepStatus = (typeof STEP_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getStepFilterConfig = () => {
  return {
    status: {
      type: "select" as const,
      options: STEP_STATUS_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "",
    },
  };
};
