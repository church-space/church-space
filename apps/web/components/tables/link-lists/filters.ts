export const LINK_LIST_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
] as const;

export type LinkListStatus = (typeof LINK_LIST_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getLinkListFilterConfig = () => {
  return {
    status: {
      type: "select" as const,
      options: [...LINK_LIST_STATUS_OPTIONS],
      defaultValue: "all",
    },
  };
};
