import React from "react";
import { cn } from "@trivo/ui/cn";

export default function ListBlock() {
  return (
    <div className="flex flex-col gap-1 py-4">
      <div className="flex flex-col ">
        <span className="text-xl font-bold">Cards</span>
        <span className="text-sm text-muted-foreground">
          Add a card to your page
        </span>
      </div>
      <div className="flex flex-col ">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className={cn(
              "flex items-start border-b py-6 px-2 gap-3",
              index === Array.from({ length: 4 }).length - 1 && "border-b-0"
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
    </div>
  );
}
