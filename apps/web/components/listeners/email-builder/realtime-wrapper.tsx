"use client";

import { createClient } from "@church-space/supabase/client";
import { getDbUserQuery } from "@church-space/supabase/queries/all/get-db-user";
import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";

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
  const userCache = useRef<Record<string, any>>({});

  const supabase = createClient();

  // Fetch user details and update presence state.  useCallback makes this stable.
  const handlePresenceUpdate = useCallback(
    async (newState: Record<string, any>) => {
      const enrichedState: Record<string, any> = {};

      for (const [key, presences] of Object.entries(newState)) {
        if (!Array.isArray(presences) || presences.length === 0) {
          continue;
        }

        const updatedPresences = await Promise.all(
          presences.map(async (presence) => {
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

      onPresenceChange?.(enrichedState); // Notify parent
    },
    [userCache, onPresenceChange, supabase],
  );

  return (
    <RealtimeListener
      emailId={parseInt(emailId)}
      onPresenceUpdate={handlePresenceUpdate} // Pass the handler
    />
  );
}
