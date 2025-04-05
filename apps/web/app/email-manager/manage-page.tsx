"use client";
import { Button } from "@church-space/ui/button";
import { Switch } from "@church-space/ui/switch";
import React, { useState } from "react";
import { LoaderIcon } from "@church-space/ui/icons";

export default function Manage({
  emailId,
  peopleEmailId,
  unsubscribeAll,
}: {
  emailId: number;
  peopleEmailId: number;
  unsubscribeAll: (emailId: number, peopleEmailId: number) => Promise<void>;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeAll(emailId, peopleEmailId);
      setUnsubscribed(true);
    } finally {
      setIsUnsubscribing(false);
    }
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
            <h1 className="text-2xl font-bold">
              Manage your email preferences
            </h1>
            <p className="text-sm text-muted-foreground">
              {emailId} {peopleEmailId}
            </p>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">Email Category</h2>
                <p className="text-sm text-muted-foreground">
                  This is an example of an email category
                </p>
              </div>
              <Switch />
            </div>
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
                "Unsubscribe All"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
