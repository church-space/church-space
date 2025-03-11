"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@church-space/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { debounce } from "lodash";

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

export default function RealtimeListener({
  emailId,
  onPresenceUpdate,
}: {
  emailId: number;
  onPresenceUpdate: (state: Record<string, any>) => void;
}) {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("initializing");
  const connectionStatusRef = useRef(connectionStatus);
  const supabase = createClient();
  const channelRef = useRef<any>(null); // Ref to hold the channel
  const simpleChannelRef = useRef<any>(null); // Ref for the simple channel
  const listenersAttached = useRef(false); // Track if listeners are attached
  const isSubscribedRef = useRef(false); // Track subscription status

  // Update the ref whenever connectionStatus changes
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  // Debounced setupChannel:  This is the KEY FIX
  const debouncedSetupChannel = useRef(
    debounce(async () => {
      if (isSubscribedRef.current) {
        console.log("Already subscribed, skipping setup.");
        return;
      }

      let isSettingUp = true;

      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id || "anonymous";

        console.log("Setting up realtime channel for email:", emailId);
        setConnectionStatus("connecting");

        if (!simpleChannelRef.current) {
          simpleChannelRef.current = supabase.channel("simple-test");
          simpleChannelRef.current.subscribe((status: string) => {
            console.log("Simple channel status:", status);
            if (status === "SUBSCRIBED") {
              console.log("Simple channel connected successfully!");
            }
          });
        }

        if (!channelRef.current) {
          channelRef.current = supabase.channel(`email-${emailId}`, {
            config: {
              presence: {
                key: userId,
              },
            },
          });
        }

        const channel = channelRef.current;

        if (!listenersAttached.current) {
          channel
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
            .on("presence", { event: "sync" }, () => {
              const newState = channel.presenceState();
              console.log("Presence sync:", newState);
              onPresenceUpdate(newState);
            })
            .on(
              "presence",
              { event: "join" },
              ({ key, newPresences }: PresenceEventPayload) => {
                console.log("User joined:", key, newPresences);
                const newState = channel.presenceState();
                onPresenceUpdate(newState);
              },
            )
            .on(
              "presence",
              { event: "leave" },
              ({ key, leftPresences }: PresenceEventPayload) => {
                console.log("User left:", key, leftPresences);
                const newState = channel.presenceState();
                onPresenceUpdate(newState);
              },
            );

          listenersAttached.current = true;
        }

        channel.subscribe(async (status: string, err: any) => {
          console.log("Main channel subscription status:", status);
          setConnectionStatus(status);

          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to channel");
            isSubscribedRef.current = true; // Set subscribed flag
            const presenceTrackStatus = await channel.track({
              user_id: userId,
              email: data.user?.email,
              name: data.user?.user_metadata?.full_name,
              online_at: new Date().toISOString(),
            });
            console.log("Presence tracking status:", presenceTrackStatus);
          } else if (status === "CLOSED") {
            console.log("Attempting to diagnose the issue...");
            console.log("Checking Supabase client configuration:");
            console.log("URL defined:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log(
              "ANON KEY defined:",
              !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            );
          } else if (status === "CHANNEL_ERROR") {
            console.error("Channel error:", err);
          } else {
            console.error("Subscription status:", status, err);
          }
        });

        isSettingUp = false;
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        setConnectionStatus("error");
        isSettingUp = false; // Ensure this is reset even on error
      }
    }, 500), // 500ms debounce
  ).current;

  useEffect(() => {
    if (!emailId) return;

    debouncedSetupChannel(); // Call the debounced function

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        connectionStatusRef.current !== "SUBSCRIBED" &&
        connectionStatusRef.current !== "connecting"
      ) {
        console.log("Tab became visible, reconnecting...");
        // Use the debounced function here too
        debouncedSetupChannel();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Cleanup: Unsubscribe and reset EVERYTHING
      if (channelRef.current) {
        console.log("Cleaning up channel subscriptions");
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (simpleChannelRef.current) {
        simpleChannelRef.current.unsubscribe();
        simpleChannelRef.current = null;
      }
      listenersAttached.current = false;
      isSubscribedRef.current = false; // Reset subscribed flag
      debouncedSetupChannel.cancel(); // Cancel any pending debounced calls
    };
  }, [emailId, supabase]); // Keep dependencies minimal

  return (
    <div style={{ display: "none" }}>
      {/* Hidden debug info */}
      <div data-connection-status={connectionStatus}></div>
    </div>
  );
}
