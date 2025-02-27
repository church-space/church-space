import { File } from "@church-space/ui/icons";
import type { FileDownloadBlockData } from "@/types/blocks";

interface FileDownloadBlockProps {
  data?: FileDownloadBlockData;
  defaultFont?: string;
}

export default function FileDownloadBlock({
  data,
  defaultFont,
}: FileDownloadBlockProps) {
  const title = data?.title || "File Name";
  const bgColor = data?.bgColor || "#ffffff";
  const textColor = data?.textColor || "#000000";

  return (
    <div
      className="p-2 pl-4 rounded-md flex justify-between items-center border"
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
