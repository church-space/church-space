"use client";
import { Button } from "@church-space/ui/button";
import React, { useState } from "react";

export default function Unsubscribe({
  emailId,
  peopleEmailId,
  unsubscribe,
}: {
  emailId: number;
  peopleEmailId: number;
  unsubscribe: () => Promise<void>;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);

  const handleUnsubscribe = async () => {
    await unsubscribe();
    setUnsubscribed(true);
  };

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="mx-3 flex flex-col rounded-md border bg-card p-4">
        {unsubscribed ? (
          <>
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-sm text-muted-foreground">
              You have successfully unsubscribed from future emails.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Confirm Unsubscribe</h1>
            <p className="text-sm text-muted-foreground">
              To unsubscribe from future emails, please click the button below.
            </p>
            <Button className="mt-4 w-full" onClick={handleUnsubscribe}>
              Unsubscribe
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
