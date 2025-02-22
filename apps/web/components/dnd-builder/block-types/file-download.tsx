import React from "react";
import { File } from "@trivo/ui/icons";
import { Button } from "@trivo/ui/button";

export default function FileDownloadBlock() {
  return (
    <div className="bg-background p-2 pl-4 rounded-md flex justify-between items-center border">
      <div className="flex items-center gap-2">
        <File height="20" width="20" />
        <p className="text-sm font-medium">File Name</p>
      </div>
      <div className="h-8 px-4 items-center flex justify-center text-sm font-medium border rounded-md">
        Download
      </div>
    </div>
  );
}
