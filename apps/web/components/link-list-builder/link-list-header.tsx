import React from "react";
import { Button } from "@church-space/ui/button";

export default function LinkListHeader() {
  return (
    <div className="h flex flex-col rounded-t-md bg-red-500 p-4 py-8">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-500"></div>
        <div className="font-semibold tracking-tight">Church Name</div>
      </div>
      <div className="mt-8 text-pretty text-4xl font-bold tracking-tight">
        This is a longer title for a list
      </div>
      <div className="mt-1 text-pretty">
        This is a longer subtitle for a list. Now I'm making it even longer.
      </div>
      <Button className="mt-8 h-10 rounded-full">Primary Button</Button>
    </div>
  );
}
