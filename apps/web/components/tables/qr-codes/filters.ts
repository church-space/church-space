export const QR_CODE_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export type QrCodeStatus = (typeof QR_CODE_STATUS_OPTIONS)[number]["value"];

// This is used for the UI display of filter options
export const getQrCodeFilterConfig = () => {
  return {
    status: {
      type: "select" as const,
      options: [...QR_CODE_STATUS_OPTIONS],
      defaultValue: "all",
    },
  };
};
