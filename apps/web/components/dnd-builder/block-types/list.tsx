import type { ListBlockData } from "@/types/blocks";
import { cn } from "@church-space/ui/cn";
import { useMemo } from "react";

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
  const bulletType = "number";

  // Memoize the items array to prevent it from changing on every render
  const items = useMemo(() => {
    const itemsArray = data?.items || [];
    return [...itemsArray].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data?.items]);

  return (
    <div
      className="flex flex-col gap-1 py-4"
      style={{ fontFamily: defaultFont || "inherit" }}
    >
      <div className="flex flex-col">
        {title !== undefined && (
          <span
            className="text-3xl font-bold"
            style={{ color: defaultTextColor }}
          >
            {title === "" ? (
              <span className="text-muted-foreground">List Title</span>
            ) : (
              title
            )}
          </span>
        )}
        {subtitle !== undefined && (
          <span
            className="text-md text-muted-foreground"
            style={{ color: defaultTextColor }}
          >
            {subtitle ? (
              subtitle
            ) : (
              <span className="text-muted-foreground">List Subtitle</span>
            )}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-medium",
                bulletType === "number" && item.description
                  ? "mt-0"
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
                className="text-lg font-semibold leading-tight"
                style={{ color: defaultTextColor }}
              >
                {item.title || (
                  <span className="text-muted-foreground">List Item</span>
                )}
              </p>
              <p
                className="overflow-hidden whitespace-pre-wrap text-pretty !break-words text-sm text-muted-foreground"
                style={{ color: defaultTextColor }}
              >
                {item.description || (
                  <span className="text-muted-foreground">
                    List Item Description
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
