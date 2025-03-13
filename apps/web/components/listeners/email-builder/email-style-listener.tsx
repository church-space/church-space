"use client";
import { createClient } from "@church-space/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { EmailStyles } from "@/components/dnd-builder/use-block-state-manager";
import { useUser } from "@/stores/use-user";
import { debounce } from "lodash";

// Generate a unique ID for this component instance
const generateInstanceId = () => {
  return Math.random().toString(36).substring(2, 9);
};

interface EmailStyleListenerProps {
  onStyleChange: (newStyles: EmailStyles) => void;
  isSaving: boolean;
}

export default function EmailStyleListener({
  onStyleChange,
  isSaving,
}: EmailStyleListenerProps) {
  const params = useParams();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : null;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useUser();
  const currentUserId = user?.id;
  const lastProcessedUpdateRef = useRef<string | null>(null);
  const updateCountRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(generateInstanceId());

  const supabase = createClient();

  // Create a debounced version of the style change handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStyleChange = useCallback(
    debounce((newStyle: EmailStyles, updatedBy: string) => {
      // Skip if this update was made by the current user
      if (updatedBy === currentUserId) {
        console.log(
          `[Style:${instanceIdRef.current}] Update skipped - made by current user`,
          updatedBy,
        );
        return;
      }

      // Skip if we're in the process of saving
      if (isSaving) {
        console.log(
          `[Style:${instanceIdRef.current}] Update skipped - currently saving`,
        );
        return;
      }

      // Increment update count
      updateCountRef.current += 1;
      console.log(
        `[Style:${instanceIdRef.current}] Processing update #${updateCountRef.current} at ${new Date().toLocaleTimeString()}`,
      );

      // Call the callback with the new style
      onStyleChange(newStyle);
    }, 300),
    [onStyleChange, currentUserId, isSaving],
  );

  useEffect(() => {
    if (!emailId || !currentUserId) return;

    console.log(
      `[Style:${instanceIdRef.current}] Setting up listener for email ID: ${emailId}, user ID: ${currentUserId}`,
    );

    // Create a channel to listen for changes on the emails table
    const channel = supabase
      .channel(`email-style-changes-${emailId}-${instanceIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "emails",
          filter: `id=eq.${emailId}`,
        },
        (payload) => {
          // Extract the style from the updated record
          const updatedEmail = payload.new;
          const updatedBy = payload.commit_timestamp || "";

          console.log(
            `[Style:${instanceIdRef.current}] Change detected at ${new Date().toLocaleTimeString()}`,
            {
              emailId: updatedEmail.id,
              timestamp: updatedBy,
            },
          );

          // Create a unique identifier for this update to prevent duplicates
          const updateId = `${updatedEmail.id}-${updatedBy}`;

          // Skip if we've already processed this exact update
          if (updateId === lastProcessedUpdateRef.current) {
            console.log(
              `[Style:${instanceIdRef.current}] Skipping duplicate update`,
              updateId,
            );
            return;
          }

          // Store this update ID to avoid processing duplicates
          lastProcessedUpdateRef.current = updateId;

          if (updatedEmail && updatedEmail.style) {
            // Parse the style if it's a string, or use it directly if it's already an object
            const newStyle =
              typeof updatedEmail.style === "string"
                ? JSON.parse(updatedEmail.style)
                : updatedEmail.style;

            // Get the user who made the update (if available)
            const updatedByUserId = updatedEmail.updated_by || null;

            console.log(
              `[Style:${instanceIdRef.current}] Queueing update for processing`,
              {
                updatedBy: updatedByUserId,
                currentUser: currentUserId,
                isSame: updatedByUserId === currentUserId,
              },
            );

            // Use the debounced handler to prevent multiple rapid updates
            debouncedStyleChange(newStyle as EmailStyles, updatedByUserId);
          }
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log(
            `[Style:${instanceIdRef.current}] Subscribed to email style changes for email ID: ${emailId}`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `[Style:${instanceIdRef.current}] Failed to subscribe to email style changes for email ID: ${emailId}`,
          );
        }
      });

    // Cleanup function
    return () => {
      console.log(
        `[Style:${instanceIdRef.current}] Cleaning up listener for email ID: ${emailId}`,
      );
      debouncedStyleChange.cancel();
      channel.unsubscribe();
    };
  }, [emailId, currentUserId, debouncedStyleChange]);

  // This component doesn't render anything
  return null;
}
