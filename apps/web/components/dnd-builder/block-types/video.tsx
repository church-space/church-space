import React from "react";
import { PlayButton } from "@trivo/ui/icons";

export default function VideoBlock() {
  return (
    <div className="relative">
      <div className="bg-background aspect-video rounded-md"></div>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-70">
        <PlayButton height="65" width="65" />
      </div>
    </div>
  );
}
