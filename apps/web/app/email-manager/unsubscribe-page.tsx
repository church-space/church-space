"use client";
import { Button } from "@church-space/ui/button";
import { LoaderIcon } from "@church-space/ui/icons";
import React, { useState } from "react";

export default function Unsubscribe({
  emailId,
  peopleEmailId,
  unsubscribe,
  resubscribeAll,
}: {
  emailId: number;
  peopleEmailId: number;
  unsubscribe: (emailId: number, peopleEmailId: number) => Promise<void>;
  resubscribeAll: (peopleEmailId: number) => Promise<void>;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribe(emailId, peopleEmailId);
      setUnsubscribed(true);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleResubscribeAll = async () => {
    try {
      setIsResubscribing(true);
      await resubscribeAll(peopleEmailId);
      setUnsubscribed(false);
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="mx-3 flex flex-col rounded-md border bg-card p-4">
        {unsubscribed ? (
          <>
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-sm text-muted-foreground">
              You have successfully unsubscribed from future emails. If this was
              an error, you can resubscribe to all emails by clicking the button
              below.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={handleResubscribeAll}
              disabled={isResubscribing}
            >
              {isResubscribing ? (
                <span className="animate-spin">
                  <LoaderIcon />
                </span>
              ) : (
                "Resubscribe to All"
              )}
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Confirm Unsubscribe</h1>
            <p className="text-sm text-muted-foreground">
              To unsubscribe from future emails, please click the button below.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
            >
              {isUnsubscribing ? (
                <span className="animate-spin">
                  <LoaderIcon />
                </span>
              ) : (
                "Unsubscribe"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
