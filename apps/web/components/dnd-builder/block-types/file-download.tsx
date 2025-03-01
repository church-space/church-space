import { File } from "@church-space/ui/icons";
import type { FileDownloadBlockData } from "@/types/blocks";
import { cn } from "@church-space/ui/cn";

interface FileDownloadBlockProps {
  data?: FileDownloadBlockData;
  defaultFont?: string;
  isRounded?: boolean;
}

export default function FileDownloadBlock({
  data,
  defaultFont,
  isRounded,
}: FileDownloadBlockProps) {
  const title = data?.title || "File Name";
  const bgColor = data?.bgColor || "#ffffff";
  const textColor = data?.textColor || "#000000";

  return (
    <div
      className={cn(
        "p-2 pl-4 flex justify-between items-center border",
        isRounded && "rounded-md"
      )}
      style={{ backgroundColor: bgColor, fontFamily: defaultFont || "inherit" }}
    >
      <div className="flex items-center gap-2">
        <File height="20" width="20" fill={textColor} />
        <p className="text-sm font-medium" style={{ color: textColor }}>
          {title}
        </p>
      </div>
      <div
        className="h-8 px-4 items-center flex justify-center text-sm font-medium border rounded-md"
        style={{ color: textColor, borderColor: textColor }}
      >
        Download
      </div>
    </div>
  );
}
