export const MEMBER_ROLE_OPTIONS = [
  { label: "All Roles", value: "all" },
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
] as const;

export type MemberRole = (typeof MEMBER_ROLE_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getMemberFilterConfig = () => {
  return {
    role: {
      type: "select" as const,
      options: MEMBER_ROLE_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      defaultValue: "all",
    },
  };
};
