"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the RealtimeListener component with no SSR
const RealtimeListener = dynamic(() => import("./realtime-listener"), {
  ssr: false,
});

export default function RealtimeWrapper({
  emailId,
  onPresenceChange,
}: {
  emailId: string;
  onPresenceChange?: (presenceState: Record<string, any>) => void;
}) {
  // Function to observe presence state changes
  useEffect(() => {
    if (!onPresenceChange) return;

    // Use MutationObserver to watch for changes to the presence state
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-presence-state"
        ) {
          const presenceStateEl = document.querySelector(
            "[data-presence-state]",
          );
          if (presenceStateEl) {
            try {
              const presenceState = JSON.parse(
                presenceStateEl.getAttribute("data-presence-state") || "{}",
              );
              onPresenceChange(presenceState);
            } catch (e) {
              console.error("Failed to parse presence state:", e);
            }
          }
        }
      });
    });

    // Start observing after a short delay to ensure the element exists
    setTimeout(() => {
      const presenceStateEl = document.querySelector("[data-presence-state]");
      if (presenceStateEl) {
        observer.observe(presenceStateEl, { attributes: true });
      }
    }, 1000);

    return () => observer.disconnect();
  }, [onPresenceChange]);

  return <RealtimeListener emailId={parseInt(emailId)} />;
}
