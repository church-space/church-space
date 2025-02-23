import React from "react";
import { cn } from "@trivo/ui/cn";
import type { ButtonBlockData } from "@/types/blocks";

interface ButtonBlockProps {
  data?: ButtonBlockData;
}

export default function ButtonBlock({ data }: ButtonBlockProps) {
  const text = data?.text || "Button";
  const color = data?.color || "#000000";
  const textColor = data?.textColor || "#FFFFFF";
  const style = data?.style || "filled";
  const size = data?.size || "fit";

  return (
    <div
      className={cn(
        "flex gap-2 w-full items-center",
        size === "fit" ? "justify-center" : "justify-stretch"
      )}
    >
      <div
        className={cn(
          "inline-flex h-9 px-4 py-2 rounded-md text-sm font-medium items-center",
          size === "full" && "w-full justify-center",
          style === "filled"
            ? ["hover:opacity-90"]
            : ["border-2", "hover:bg-opacity-10"]
        )}
        style={{
          backgroundColor: style === "filled" ? color : "transparent",
          borderColor: style === "outline" ? color : "transparent",
          color: style === "outline" ? color : textColor,
        }}
      >
        {text}
      </div>
    </div>
  );
}
