import React from "react";
import { cn } from "@church-space/ui/cn";
import type { ButtonBlockData } from "@/types/blocks";

interface ButtonBlockProps {
  data?: ButtonBlockData;
  defaultFont?: string;
  cornerRadius?: number;
}

export default function ButtonBlock({
  data,
  defaultFont,
  cornerRadius,
}: ButtonBlockProps) {
  const text = data?.text || "";
  const color = data?.color || "#000000";
  const textColor = data?.textColor || "#FFFFFF";
  const style = data?.style || "filled";
  const size = data?.size || "fit";
  const centered = data?.centered ?? true;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2",
        size === "fit"
          ? "justify-center"
          : size === "medium"
            ? "justify-center"
            : "justify-stretch",

        centered ? "justify-center" : "justify-start",
      )}
    >
      <div
        className={cn(
          "inline-flex h-9 items-center px-4 py-2 text-sm font-semibold",
          size === "full" && "w-full justify-center",
          size === "medium" && "!text-cetner w-fit justify-center px-16",
          size === "large" && "!text-cetner h-12 w-fit justify-center px-8",
          style === "filled"
            ? ["hover:opacity-90"]
            : ["border-2", "hover:bg-opacity-10"],
        )}
        style={{
          backgroundColor: style === "filled" ? color : "transparent",
          borderColor: style === "outline" ? color : "transparent",
          color: style === "outline" ? color : textColor,
          fontFamily: defaultFont || "inherit",
          borderRadius: cornerRadius ? `${cornerRadius * 0.3}px` : "0",
        }}
      >
        {text && text.length > 0 ? (
          text
        ) : (
          <span className="text-muted-foreground">Button</span>
        )}
      </div>
    </div>
  );
}
