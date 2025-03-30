export type StepStatus = "waiting" | "completed" | "all";

export function getStepFilterConfig() {
  return {
    status: {
      type: "select" as const,
      options: [
        { label: "All", value: "all" },
        { label: "Waiting", value: "waiting" },
        { label: "Completed", value: "completed" },
      ],
    },
  };
}
