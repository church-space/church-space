"use client";

import { useEffect, useState } from "react";
import { createClient } from "@church-space/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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

export default function RealtimeListener({ emailId }: { emailId: number }) {
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const [connectionStatus, setConnectionStatus] =
    useState<string>("initializing");
  const supabase = createClient();

  console.log(presenceState);

  useEffect(() => {
    if (!emailId) return;

    let channel: any;
    let simpleChannel: any;

    // Get the user ID first, then create the channel
    const setupChannel = async () => {
      try {
        // Get current user info
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id || "anonymous";

        console.log("Setting up realtime channel for email:", emailId);
        setConnectionStatus("connecting");

        // Create a simple channel first to test basic connectivity
        simpleChannel = supabase.channel("simple-test");

        // Create the main channel with a simpler configuration
        channel = supabase.channel(`email-${emailId}`, {
          config: {
            presence: {
              key: userId,
            },
          },
        });

        // Listen for changes to the emails table for this specific emailId
        channel

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

          // Listen for changes to the emails table for this specific emailId
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

        // Subscribe to the simple channel first
        simpleChannel.subscribe((status: string) => {
          console.log("Simple channel status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Simple channel connected successfully!");
          }
        });

        // Subscribe to the main channel with better error handling
        channel.subscribe(async (status: string, err: any) => {
          console.log("Main channel subscription status:", status);
          setConnectionStatus(status);

          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to channel");
            // Track presence once subscribed
            const presenceTrackStatus = await channel.track({
              user_id: userId,
              email: data.user?.email,
              name: data.user?.user_metadata?.full_name,
              online_at: new Date().toISOString(),
            });

            console.log("Presence tracking status:", presenceTrackStatus);
          } else if (status === "CLOSED") {
            console.log("Attempting to diagnose the issue...");

            // Try to diagnose the issue
            console.log("Checking Supabase client configuration:");
            console.log("URL defined:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log(
              "ANON KEY defined:",
              !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            );
          } else if (status === "CHANNEL_ERROR") {
            console.error(
              "Channel error:",
              err || "No error details available",
            );
          } else {
            console.error(
              "Subscription status:",
              status,
              err || "No error details available",
            );
          }
        });

        // Return cleanup function
        return () => {
          console.log("Cleaning up channel subscriptions");
          channel.unsubscribe();
          simpleChannel.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        setConnectionStatus("error");
        return () => {}; // Empty cleanup function in case of error
      }
    };

    // Set up visibility change handler to reconnect when tab becomes visible again
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        connectionStatus !== "SUBSCRIBED"
      ) {
        console.log("Tab became visible, reconnecting...");

        // Clean up existing channels if they exist
        if (channel) channel.unsubscribe();
        if (simpleChannel) simpleChannel.unsubscribe();

        // Set up channels again
        setupChannel();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const cleanupPromise = setupChannel();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanupPromise.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, [emailId, supabase, connectionStatus]);

  return (
    <div style={{ display: "none" }}>
      {/* Hidden debug info */}
      <div data-connection-status={connectionStatus}></div>
      <div data-presence-state={JSON.stringify(presenceState)}></div>
    </div>
  );
}
