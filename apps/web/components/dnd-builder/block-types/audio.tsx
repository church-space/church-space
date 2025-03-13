import { Slider } from "@church-space/ui/slider";
import { Play, Pause } from "lucide-react";
import React from "react";

export default function AudioBlock() {
  return (
    <div className="flex h-16 w-full flex-col rounded-md border bg-card p-2 px-3">
      <div className="font-medium">Audio Title</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play />
          <Pause />
        </div>
        <Slider value={[30]} />
      </div>
    </div>
  );
}
