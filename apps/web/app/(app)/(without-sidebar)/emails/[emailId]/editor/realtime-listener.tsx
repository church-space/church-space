"use client";

import { useEffect, useState } from "react";
import { createClient } from "@church-space/supabase/client";
import type {
  RealtimePostgresChangesPayload,
  User,
} from "@supabase/supabase-js";

type PresenceUser = {
  user_id: string;
  email?: string;
  name?: string;
  online_at: string;
};

type PresenceEventPayload = {
  key: string;
  newPresences?: PresenceUser[];
  leftPresences?: PresenceUser[];
};

export default function RealtimeListener({ emailId }: { emailId: string }) {
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const supabase = createClient();

  console.log(presenceState);

  useEffect(() => {
    if (!emailId) return;

    // Get the user ID first, then create the channel
    const setupChannel = async () => {
      try {
        // Get current user info
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id || "anonymous";

        // Create a channel for this specific email
        const channel = supabase.channel(`email:${emailId}`, {
          config: {
            presence: {
              key: userId,
            },
          },
        });

        // Listen for changes to the emails table for this specific emailId
        channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "emails",
              filter: `id=eq.${emailId}`,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log("Email change received:", payload);
            },
          )
          // Listen for changes to the email_footers table for this specific emailId
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "email_footers",
              filter: `email_id=eq.${emailId}`,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log("Email footer change received:", payload);
            },
          )
          // Listen for changes to the email_blocks table for this specific emailId
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "email_blocks",
              filter: `email_id=eq.${emailId}`,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log("Email block change received:", payload);
            },
          )
          // Set up presence handlers
          .on("presence", { event: "sync" }, () => {
            const newState = channel.presenceState();
            console.log("Presence sync:", newState);
            setPresenceState(newState as Record<string, any>);
          })
          .on(
            "presence",
            { event: "join" },
            ({ key, newPresences }: PresenceEventPayload) => {
              console.log("User joined:", key, newPresences);
            },
          )
          .on(
            "presence",
            { event: "leave" },
            ({ key, leftPresences }: PresenceEventPayload) => {
              console.log("User left:", key, leftPresences);
            },
          );

        // Subscribe to the channel
        channel.subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            // Track presence once subscribed
            const presenceTrackStatus = await channel.track({
              user_id: userId,
              email: data.user?.email,
              name: data.user?.user_metadata?.full_name,
              online_at: new Date().toISOString(),
            });

            console.log("Presence tracking status:", presenceTrackStatus);
          }
        });

        // Return cleanup function
        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        return () => {}; // Empty cleanup function in case of error
      }
    };

    const cleanupPromise = setupChannel();
    return () => {
      cleanupPromise.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, [emailId, supabase]);

  // This component doesn't render anything visible
  return null;
}
