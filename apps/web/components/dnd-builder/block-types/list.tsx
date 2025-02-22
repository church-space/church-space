import React from "react";
import { cn } from "@trivo/ui/cn";

export default function ListBlock() {
  return (
    <div className="flex flex-col py-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className={cn(
            "flex items-start border-b py-6 px-2 gap-3",
            index === 0 && "border-t"
          )}
          key={index}
        >
          <div className=" h-8 w-8 flex-shrink-0 bg-primary rounded-full text-primary-foreground flex items-center justify-center font-medium text-lg">
            {index + 1}
          </div>
          <div className="flex flex-col">
            <p className=" font-medium text-lg">This is text here</p>
            <p className="text-sm text-muted-foreground">This is text here</p>
          </div>
        </div>
      ))}
    </div>
  );
}
