"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getDbUserQuery } from "@church-space/supabase/queries/all/get-db-user";
import { createClient } from "@church-space/supabase/client";

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
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const [enrichedPresenceState, setEnrichedPresenceState] = useState<
    Record<string, any>
  >({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };

    getCurrentUser();
  }, [supabase]);

  // Function to observe presence state changes
  useEffect(() => {
    if (!onPresenceChange) return;

    // Function to read and process presence state
    const processPresenceState = () => {
      const presenceStateEl = document.querySelector("[data-presence-state]");
      if (presenceStateEl) {
        try {
          const presenceState = JSON.parse(
            presenceStateEl.getAttribute("data-presence-state") || "{}",
          );
          setPresenceState(presenceState);
        } catch (e) {
          console.error("Failed to parse presence state:", e);
        }
      }
    };

    // Use MutationObserver to watch for changes to the presence state
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-presence-state"
        ) {
          processPresenceState();
        }
      });
    });

    // Start observing after a short delay to ensure the element exists
    const timeout = setTimeout(() => {
      const presenceStateEl = document.querySelector("[data-presence-state]");
      if (presenceStateEl) {
        // Process initial state
        processPresenceState();

        // Then start observing for changes
        observer.observe(presenceStateEl, { attributes: true });
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [onPresenceChange]);

  // Fetch user details for each user in the presence state
  useEffect(() => {
    const fetchUserDetails = async () => {
      const enrichedState = { ...presenceState };

      for (const [key, presences] of Object.entries(presenceState)) {
        const updatedPresences = await Promise.all(
          (presences as any[]).map(async (presence) => {
            if (presence.user_id) {
              try {
                const userDetails = await getDbUserQuery(
                  supabase,
                  presence.user_id,
                );
                if (userDetails?.userDetails) {
                  return {
                    ...presence,
                    first_name: userDetails.userDetails.first_name,
                    last_name: userDetails.userDetails.last_name,
                    avatar_url: userDetails.userDetails.avatar_url,
                  };
                }
              } catch (error) {
                console.error("Error fetching user details:", error);
              }
            }
            return presence;
          }),
        );
        enrichedState[key] = updatedPresences;
      }

      setEnrichedPresenceState(enrichedState);
      if (onPresenceChange) {
        // Filter out the current user before passing to onPresenceChange
        const filteredState = { ...enrichedState };
        for (const key in filteredState) {
          filteredState[key] = (filteredState[key] as any[]).filter(
            (presence) => presence.user_id !== currentUserId,
          );

          // Remove empty arrays
          if (filteredState[key].length === 0) {
            delete filteredState[key];
          }
        }

        onPresenceChange(filteredState);
      }
    };

    if (Object.keys(presenceState).length > 0) {
      fetchUserDetails();
    }
  }, [presenceState, onPresenceChange, currentUserId]);

  return <RealtimeListener emailId={parseInt(emailId)} />;
}
