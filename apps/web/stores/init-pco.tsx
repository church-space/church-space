"use client";

import { useEffect, useRef, useState } from "react";
import { usePco } from "./use-pco";
import { useRouter } from "next/navigation";

interface PcoData {
  id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  last_refreshed: string | null;
}

export default function InitPco({ pcoData }: { pcoData: PcoData }) {
  const initState = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!initState.current && pcoData) {
      usePco.setState({
        id: pcoData.id,
        accessToken: pcoData.access_token,
        refreshToken: pcoData.refresh_token,
        lastRefreshed: pcoData.last_refreshed,
      });
    }

    initState.current = true;

    const checkAndRefreshToken = async () => {
      const currentPcoState = usePco.getState();
      if (!currentPcoState.lastRefreshed || isRefreshing) {
        return;
      }

      const lastRefreshed = new Date(currentPcoState.lastRefreshed);
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      if (lastRefreshed < twoHoursAgo && lastRefreshed > ninetyDaysAgo) {
        setIsRefreshing(true);

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
              usePco.setState({
                id: null,
                accessToken: null,
                refreshToken: null,
                lastRefreshed: null,
              });
              router.push("/pco-reconnect");
            }
          } else {
            usePco.setState({
              id: data.id,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              lastRefreshed: data.lastRefreshed,
            });
          }
        } catch (error) {
          console.error("Error during PCO token refresh fetch:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    checkAndRefreshToken();
  }, [pcoData, isRefreshing, router]);

  return null;
}
