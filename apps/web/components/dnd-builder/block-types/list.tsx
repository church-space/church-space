import type { ListBlockData } from "@/types/blocks";
import { cn } from "@church-space/ui/cn";

interface ListBlockProps {
  data?: ListBlockData;
  defaultFont?: string;
  defaultTextColor?: string;
}

export default function ListBlock({
  data,
  defaultFont,
  defaultTextColor,
}: ListBlockProps) {
  const title = data?.title || "";
  const subtitle = data?.subtitle || "";
  const bulletColor = data?.bulletColor || "#000000";
  const bulletType = data?.bulletType || "number";
  const items = data?.items || [];

  return (
    <div
      className="flex flex-col gap-1 py-4"
      style={{ fontFamily: defaultFont || "inherit" }}
    >
      <div className="flex flex-col">
        {title && (
          <span
            className="text-2xl font-bold"
            style={{ color: defaultTextColor }}
          >
            {title}
          </span>
        )}
        {subtitle && (
          <span
            className="text-md text-muted-foreground"
            style={{ color: defaultTextColor }}
          >
            {subtitle}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4 items-start",
              bulletType === "bullet" ? "gap-0" : ""
            )}
          >
            <div
              className={cn(
                "h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center font-medium text-lg",
                bulletType === "bullet" ? "text-4xl h-6 pt-2 w-6" : "",
                bulletType === "number" && item.description ? "mt-1" : "-mt-0.5"
              )}
              style={{
                backgroundColor:
                  bulletType === "number" ? bulletColor : "transparent",
                color: bulletType === "number" ? "#FFFFFF" : defaultTextColor,
              }}
            >
              {bulletType === "number" ? index + 1 : "•"}
            </div>
            <div className="flex flex-col">
              <p
                className="font-semibold text-lg"
                style={{ color: defaultTextColor }}
              >
                {item.title}
              </p>
              <p
                className="text-sm text-muted-foreground text-pretty !break-words overflow-hidden whitespace-pre-wrap"
                style={{ color: defaultTextColor }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
