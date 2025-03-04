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
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4",
              bulletType === "bullet" ? "gap-0" : "",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-medium",
                bulletType === "bullet" ? "h-6 w-6 pt-2 text-4xl" : "",
                bulletType === "number" && item.description
                  ? "mt-1"
                  : "-mt-0.5",
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
                className="text-lg font-semibold"
                style={{ color: defaultTextColor }}
              >
                {item.title}
              </p>
              <p
                className="overflow-hidden whitespace-pre-wrap text-pretty !break-words text-sm text-muted-foreground"
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
