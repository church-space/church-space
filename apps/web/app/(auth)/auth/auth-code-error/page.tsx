import React from "react";

export default function Page() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-sm text-muted-foreground">
          Please try again or contact support.
        </p>
      </div>
    </div>
  );
}
