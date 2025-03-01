import React from "react";
import { Separator } from "@church-space/ui/separator";
import type { DividerBlockData } from "@/types/blocks";

interface DividerBlockProps {
  data?: DividerBlockData;
}

export default function DividerBlock({ data }: DividerBlockProps) {
  const color = data?.color || "#e2e8f0"; // default color
  const margin = data?.margin || 0; // default margin

  return (
    <Separator
      className="w-full"
      style={{
        backgroundColor: color,
        marginTop: margin,
        marginBottom: margin,
      }}
    />
  );
}
