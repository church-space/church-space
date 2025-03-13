"use client";
import { createClient } from "@church-space/supabase/client";
import { useUser } from "@/stores/use-user";
import { useEffect, useState } from "react";
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

  const supabase = createClient();

  useEffect(() => {
    if (!user || !emailId) return;

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
        const newState = channel.presenceState();
        setOnlineUsers(newState);
        onOnlineUsersChange(newState);
      })
      .on("presence", { event: "join" }, async ({ key, newPresences }) => {
        // When a new user joins, fetch their details if we don't have them
        if (key !== user.id) {
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

              // Notify parent component
              onOnlineUsersChange({
                ...onlineUsers,
                [key]: updatedPresences,
              });
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        }
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
