"use client";
import { createClient } from "@church-space/supabase/client";
import { useUser } from "@/stores/use-user";
import { useEffect, useState, useRef } from "react";
import { getDbUserQuery } from "@church-space/supabase/queries/all/get-db-user";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

interface OnlineUsersProps {
  onOnlineUsersChange: (onlineUsers: Record<string, any>) => void;
}

export default function EmailBuilderRealtimeListener({
  onOnlineUsersChange,
}: OnlineUsersProps) {
  const { user, firstName, lastName, avatarUrl } = useUser();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});
  const params = useParams();
  const emailId = params.emailId ? params.emailId.toString() : null;
  // Keep track of users who have left
  const leftUsersRef = useRef<Set<string>>(new Set());
  // Keep a reference to the current user's ID to ensure we don't include them in the online users list
  const currentUserIdRef = useRef<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!user || !emailId) return;

    // Store the current user's ID
    currentUserIdRef.current = user.id;

    // Create a presence channel for this specific email
    const channel = supabase.channel(`email-builder:${emailId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence changes
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();

        // Filter out any users who we know have left and the current user
        const filteredState = { ...presenceState };

        // Remove users who have left
        leftUsersRef.current.forEach((userId) => {
          delete filteredState[userId];
        });

        // Remove the current user from the list we send to the parent
        // This ensures we don't show the current user in the online users list
        if (currentUserIdRef.current) {
          delete filteredState[currentUserIdRef.current];
        }

        setOnlineUsers(filteredState);
        onOnlineUsersChange(filteredState);
      })
      .on("presence", { event: "join" }, async ({ key, newPresences }) => {
        // Skip processing if this is the current user
        if (key === currentUserIdRef.current) {
          return;
        }

        // When a user joins, remove them from the left users set if they were there
        if (leftUsersRef.current.has(key)) {
          leftUsersRef.current.delete(key);
        }

        // When a new user joins, fetch their details if we don't have them
        try {
          const response = await getDbUserQuery(supabase, key);

          // Update the presence with user details
          if (response?.userDetails) {
            const userDetails = response.userDetails;

            const updatedPresences = newPresences.map((presence: any) => ({
              ...presence,
              first_name: userDetails.first_name,
              last_name: userDetails.last_name,
              avatar_url: userDetails.avatar_url,
            }));

            // Update the state with the new user details
            setOnlineUsers((prevState) => ({
              ...prevState,
              [key]: updatedPresences,
            }));

            // Create a new state object for the parent component
            // that excludes the current user
            const newParentState = { ...onlineUsers, [key]: updatedPresences };
            if (currentUserIdRef.current) {
              delete newParentState[currentUserIdRef.current];
            }

            // Notify parent component
            onOnlineUsersChange(newParentState);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        // Skip processing if this is the current user
        if (key === currentUserIdRef.current) {
          return;
        }

        // Add the user to our set of users who have left
        leftUsersRef.current.add(key);

        // When a user leaves, remove them from the online users list
        setOnlineUsers((prevState) => {
          const newState = { ...prevState };
          delete newState[key];
          return newState;
        });

        // Also immediately update the parent component
        onOnlineUsersChange((prevState: Record<string, any>) => {
          const newState = { ...prevState };
          delete newState[key];
          // Ensure the current user is not in the list
          if (currentUserIdRef.current) {
            delete newState[currentUserIdRef.current];
          }
          return newState;
        });
      });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Track the current user's presence
        await channel.track({
          online_at: new Date().toISOString(),
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        });
      }
    });

    setChannel(channel);

    // Cleanup function
    return () => {
      channel.unsubscribe();
    };
  }, [user, emailId, firstName, lastName, avatarUrl, onOnlineUsersChange]);

  return null; // This component doesn't render anything
}
