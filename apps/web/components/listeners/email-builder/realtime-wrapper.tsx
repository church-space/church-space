"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback } from "react";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const userCache = useRef<Record<string, any>>({});

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

  // Fetch user details and update presence state.  useCallback makes this stable.
  const handlePresenceUpdate = useCallback(
    async (newState: Record<string, any>) => {
      console.log("Processing presence state:", newState);

      const enrichedState: Record<string, any> = {};

      for (const [key, presences] of Object.entries(newState)) {
        if (!Array.isArray(presences) || presences.length === 0) {
          continue;
        }

        const updatedPresences = await Promise.all(
          (presences as any[]).map(async (presence) => {
            if (presence.user_id) {
              if (userCache.current[presence.user_id]) {
                const cachedUser = userCache.current[presence.user_id];
                return {
                  ...presence,
                  first_name: cachedUser.first_name,
                  last_name: cachedUser.last_name,
                  avatar_url: cachedUser.avatar_url,
                };
              }

              try {
                const userDetails = await getDbUserQuery(
                  supabase,
                  presence.user_id,
                );
                if (userDetails?.userDetails) {
                  const userData = {
                    first_name: userDetails.userDetails.first_name,
                    last_name: userDetails.userDetails.last_name,
                    avatar_url: userDetails.userDetails.avatar_url,
                  };

                  userCache.current[presence.user_id] = userData;

                  return {
                    ...presence,
                    ...userData,
                  };
                }
              } catch (error) {
                console.error("Error fetching user details:", error);
              }
            }
            return presence;
          }),
        );
        if (updatedPresences.length > 0) {
          enrichedState[key] = updatedPresences;
        }
      }

      // Filter out the current user
      const filteredState = { ...enrichedState };
      for (const key in filteredState) {
        if (!filteredState[key]) continue;

        filteredState[key] = (filteredState[key] as any[]).filter(
          (presence) => presence.user_id !== currentUserId,
        );

        if (!filteredState[key] || filteredState[key].length === 0) {
          delete filteredState[key];
        }
      }

      console.log("Sending to UI:", filteredState);
      setPresenceState(filteredState); // Update local state
      onPresenceChange?.(filteredState); // Notify parent
    },
    [currentUserId, userCache, onPresenceChange, supabase],
  ); // Add dependencies to useCallback

  return (
    <RealtimeListener
      emailId={parseInt(emailId)}
      onPresenceUpdate={handlePresenceUpdate} // Pass the handler
    />
  );
}
