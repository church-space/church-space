import React from "react";
import { Button } from "@trivo/ui/button";

export default function CardsBlock() {
  return (
    <div className="flex flex-col gap-1 py-4">
      <div className="flex flex-col ">
        <span className="text-xl font-bold">Cards</span>
        <span className="text-sm text-muted-foreground">
          Add a card to your page
        </span>
      </div>
      <div className=" gap-6 grid grid-cols-1 lg:grid-cols-2 gap-y-10 ">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="w-full flex flex-col gap-2" key={index}>
            <div className="bg-blue-500 rounded-md w-full h-full aspect-video"></div>
            <div className="flex flex-col px-1 gap-0.5">
              <h3 className="text-sm font-medium text-blue-500">Card 1</h3>
              <h3 className="text-lg font-bold">Card 1</h3>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam, quos.
              </p>
            </div>
            <Button variant="outline">Read More</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
