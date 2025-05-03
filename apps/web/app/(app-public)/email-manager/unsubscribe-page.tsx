"use client";

import { Button } from "@church-space/ui/button";
import { LoaderIcon } from "@church-space/ui/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Unsubscribe({
  unsubscribe,
  resubscribeAll,
  token,
}: {
  unsubscribe: () => Promise<void>;
  resubscribeAll: () => Promise<void>;
  token: string;
}) {
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);

  const router = useRouter();

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribe();
      setUnsubscribed(true);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleResubscribeAll = async () => {
    try {
      setIsResubscribing(true);
      await resubscribeAll();
      setUnsubscribed(false);
    } finally {
      setIsResubscribing(false);
    }
  };

  const setType = (type: string, token: string) => {
    router.push(`/email-manager?type=${type}&tk=${token}`);
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
                "Unsubscribe from All Emails"
              )}
            </Button>
            <Button
              className="mt-4 w-full"
              onClick={() => setType("manage", token)}
              variant="outline"
            >
              Manage Email Preferences
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
