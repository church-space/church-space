"use client";

import React, { useState } from "react";
import { Button } from "@church-space/ui/button";
import Image from "next/image";

export default function ConnectToPcoButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-callback`;
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
        className="w-full bg-foreground px-4 py-2"
        onClick={handleConnect}
        disabled={isLoading}
      >
        <Image src={"/pco-logo.png"} alt="PCO Logo" width={22} height={22} />{" "}
        Connect to PCO
      </Button>
      <span className="px-4 text-center text-sm text-muted-foreground">
        Click the button above to connect to your Planning Center account.
      </span>
    </div>
  );
}

export function ReConnectToPcoButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/pco-reconnect-callback`;
      const authUrl = new URL(
        "https://api.planningcenteronline.com/oauth/authorize",
      );
      authUrl.searchParams.set(
        "client_id",
        process.env.NEXT_PUBLIC_PCO_CLIENT_ID!,
      );
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "people registrations groups");

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error initiating PCO connection:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="w-full px-4 py-2"
        onClick={handleConnect}
        disabled={isLoading}
      >
        <Image src={"/pco-logo.png"} alt="PCO Logo" width={22} height={22} />{" "}
        Reconnect to PCO
      </Button>
      <span className="px-4 text-center text-sm text-muted-foreground">
        Click the button above to reconnect to your Planning Center account.
      </span>
    </div>
  );
}
