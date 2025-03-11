"use client";

import { createClient } from "@church-space/supabase/client";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

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
      // More robust check to prevent multiple subscriptions
      if (
        isSubscribedRef.current ||
        connectionStatusRef.current === "connecting"
      ) {
        console.log("Setup already in progress or completed, skipping");
        return;
      }

      // Set status immediately to prevent race conditions
      setConnectionStatus("connecting");

      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id || "anonymous";

        // Clean up any existing channels first to prevent multiple subscriptions
        if (channelRef.current) {
          console.log("Cleaning up existing channel before creating a new one");
          try {
            // Use a promise to ensure unsubscribe completes before continuing
            await new Promise<void>((resolve) => {
              channelRef.current
                .unsubscribe()
                .then(() => {
                  console.log("Channel unsubscribed successfully");
                  resolve();
                })
                .catch((err: any) => {
                  console.warn("Error unsubscribing from channel:", err);
                  resolve(); // Resolve anyway to continue
                });
            });
          } catch (e) {
            console.warn("Exception during channel cleanup:", e);
          }
          channelRef.current = null;
          listenersAttached.current = false;
        }

        if (simpleChannelRef.current) {
          try {
            await simpleChannelRef.current.unsubscribe();
          } catch (e) {
            console.warn("Error unsubscribing from simple channel:", e);
          }
          simpleChannelRef.current = null;
        }

        // Create new channels
        simpleChannelRef.current = supabase.channel("simple-test");

        // Create the main channel with timeout handling
        channelRef.current = supabase.channel(`email-${emailId}`, {
          config: {
            presence: {
              key: userId,
            },
          },
        });

        const channel = channelRef.current;
        console.log("Created new channel:", `email-${emailId}`);

        // Attach listeners
        channel
          .on(
            "presence",
            { event: "sync" },
            (payload: { presence: Record<string, PresenceUser[]> }) => {
              const newState = channel.presenceState();
              console.log("Presence sync event:", payload);
              console.log("Current presence state:", newState);
              onPresenceUpdate(newState);
            },
          )
          .on(
            "presence",
            { event: "join" },
            (payload: PresenceEventPayload) => {
              const newState = channel.presenceState();
              console.log("Presence join event:", payload);
              console.log("User joined:", payload.newPresences);
              console.log("Updated presence state:", newState);
              onPresenceUpdate(newState);
            },
          )
          .on(
            "presence",
            { event: "leave" },
            (payload: PresenceEventPayload) => {
              const newState = channel.presenceState();
              console.log("Presence leave event:", payload);
              console.log("User left:", payload.leftPresences);
              console.log("Updated presence state:", newState);
              onPresenceUpdate(newState);
            },
          );

        listenersAttached.current = true;
        console.log("Listeners attached, subscribing to channel");

        // Subscribe to the channel with timeout handling
        let subscriptionComplete = false;

        // Set a timeout to handle stalled subscriptions
        const timeoutId = setTimeout(() => {
          if (!subscriptionComplete) {
            console.warn("Channel subscription timed out, will retry later");
            // Reset flags to allow retry
            isSubscribedRef.current = false;
            setConnectionStatus("error");
          }
        }, 10000); // 10 second timeout

        // Subscribe to the channel
        channel.subscribe(async (status: string, err: any) => {
          console.log("Channel subscription status:", status);
          setConnectionStatus(status);

          if (status === "SUBSCRIBED") {
            subscriptionComplete = true;
            clearTimeout(timeoutId);
            isSubscribedRef.current = true;

            try {
              const presenceTrackStatus = await channel.track({
                user_id: userId,
                email: data.user?.email,
                name: data.user?.user_metadata?.full_name,
                online_at: new Date().toISOString(),
              });
              console.log("Presence track status:", presenceTrackStatus);
              console.log("Initial presence state:", channel.presenceState());
            } catch (trackError) {
              console.error("Error tracking presence:", trackError);
            }
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            console.error(`Channel ${status}:`, err);
            // Reset subscription status on error
            isSubscribedRef.current = false;
            subscriptionComplete = true;
            clearTimeout(timeoutId);

            // Only attempt reconnect if not already reconnecting
            if (
              status === "TIMED_OUT" &&
              connectionStatusRef.current !== "connecting"
            ) {
              console.log("Will attempt to reconnect after timeout");
              setTimeout(() => {
                if (!isSubscribedRef.current) {
                  debouncedSetupChannel();
                }
              }, 2000); // Wait 2 seconds before reconnecting
            }
          }
        });
      } catch (error) {
        console.error("Error setting up realtime listener:", error);
        setConnectionStatus("error");
        // Reset subscription status on error
        isSubscribedRef.current = false;
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
        // Use the debounced function here too
        debouncedSetupChannel();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Cleanup: Unsubscribe and reset EVERYTHING
      if (channelRef.current) {
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
