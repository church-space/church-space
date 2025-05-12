"use client";

import { useEffect } from "react";
import { usePco } from "@/stores/use-pco";
import { useRouter } from "next/navigation";

export default function PcoRefresh() {
  const router = useRouter();
  const pcoState = usePco();

  useEffect(() => {
    const refreshPcoToken = async () => {
      // If we don't have a token at all, return early
      if (!pcoState.refreshToken) return;

      console.log("Forcing PCO token refresh...");
      try {
        const response = await fetch("/api/pco/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to refresh PCO token:", data);
          if (data.requiresReconnect) {
            console.log("Redirecting to /pco-reconnect due to API response.");
            usePco.setState({
              id: null,
              accessToken: null,
              refreshToken: null,
              lastRefreshed: null,
            });
            router.push("/pco-reconnect");
          }
        } else {
          console.log("PCO token refreshed successfully.");
          usePco.setState({
            id: data.id,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            lastRefreshed: data.lastRefreshed,
          });
        }
      } catch (error) {
        console.error("Error during PCO token refresh fetch:", error);
      }
    };

    refreshPcoToken();
  }, [pcoState.refreshToken, router]);

  return null;
}
