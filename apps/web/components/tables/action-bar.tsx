import { Button } from "@church-space/ui/button";
import React from "react";

export default function ActionBar() {
  return (
    <div className="mx-auto flex h-10 w-fit items-center rounded-lg border bg-muted px-1">
      <Button variant="outline" className="h-8">
        Delete
      </Button>
    </div>
  );
}
