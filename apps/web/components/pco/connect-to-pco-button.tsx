"use client";

import React, { useState } from "react";
import { Button } from "@church-space/ui/button";
import { PcoLogo } from "@church-space/ui/icons";

interface ConnectToPcoButtonProps {
  isReconnect: boolean;
}

export default function ConnectToPcoButton({
  isReconnect = false,
}: ConnectToPcoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      const redirectUri = isReconnect
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-reconnect-callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-callback`;
      const authUrl = new URL(
        "https://api.planningcenteronline.com/oauth/authorize",
      );
      authUrl.searchParams.set(
        "client_id",
        process.env.NEXT_PUBLIC_PCO_CLIENT_ID!,
      );
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "people");

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error initiating PCO connection:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="h-12 w-full border bg-background px-4 py-2 text-base font-semibold text-foreground shadow-md hover:bg-accent dark:bg-foreground dark:text-background"
        onClick={handleConnect}
        disabled={isLoading}
      >
        <PcoLogo width={"22"} height={"22"} fill="#2266F7" />{" "}
        {isReconnect ? "Reconnect to PCO" : "Connect to Planning Center"}
      </Button>
      {isReconnect && (
        <span className="text-balance px-4 text-center text-sm text-muted-foreground">
          {isReconnect
            ? "Click the button above to reconnect to your Planning Center account."
            : "Click the button above to connect to your Planning Center account."}
        </span>
      )}
    </div>
  );
}
