import type { FileDownloadBlockData } from "@/types/blocks";
import { cn } from "@church-space/ui/cn";

interface FileDownloadBlockProps {
  data?: FileDownloadBlockData;
  defaultFont?: string;
  cornerRadius?: number;
}

export default function FileDownloadBlock({
  data,
  defaultFont,
  cornerRadius,
}: FileDownloadBlockProps) {
  const title = data?.title || "";
  const bgColor = data?.bgColor || "#f0f0f0";
  const textColor = data?.textColor || "#000000";

  return (
    <div
      className={cn("flex items-center justify-between p-2 pl-4")}
      style={{
        backgroundColor: bgColor,
        fontFamily: defaultFont || "inherit",
        borderRadius: cornerRadius ? `${cornerRadius * 0.4}px` : "0",
      }}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm" style={{ color: textColor, fontWeight: "400" }}>
          {title ? title : <span className="text-gray-500">File Name</span>}
        </p>
      </div>
      <div
        className="flex h-8 items-center justify-center rounded-md border px-4 text-sm font-medium"
        style={{
          color: bgColor,
          borderColor: bgColor,
          backgroundColor: textColor,
          borderRadius: cornerRadius ? `${cornerRadius * 0.4}px` : "0",
        }}
      >
        Download
      </div>
    </div>
  );
}
