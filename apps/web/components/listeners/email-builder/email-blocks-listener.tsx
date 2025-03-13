"use client";
import { createClient } from "@church-space/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Block, BlockType } from "@/types/blocks";
import { useUser } from "@/stores/use-user";
import { debounce } from "lodash";

interface EmailBlocksListenerProps {
  onBlocksChange: (newBlocks: Block[]) => void;
  isSaving: boolean;
}

// Define the database block type to match what comes from Supabase
interface DatabaseBlock {
  id: number;
  email_id: number;
  type: BlockType;
  value: any;
  order: number;
  created_at: string;
  linked_file: string | null;
  updated_by?: string | null;
}

export default function EmailBlocksListener({
  onBlocksChange,
  isSaving,
}: EmailBlocksListenerProps) {
  const params = useParams();
  const emailId = params.emailId
    ? parseInt(params.emailId as string, 10)
    : null;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useUser();
  const currentUserId = user?.id;
  const lastProcessedUpdateRef = useRef<string | null>(null);
  const processingUpdateRef = useRef<boolean>(false);

  const supabase = createClient();

  // Convert database blocks to the Block type expected by the application
  const convertDatabaseBlocksToAppBlocks = (
    dbBlocks: DatabaseBlock[],
  ): Block[] => {
    return dbBlocks.map((block) => ({
      id: block.id.toString(), // Convert number to string
      type: block.type,
      data: block.value, // Assuming value contains the block data
      order: block.order,
    }));
  };

  // Create a debounced version of the blocks change handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchAndProcessBlocks = useCallback(
    debounce(async (updateId: string, updatedByUserId: string | null) => {
      // Skip if this update was made by the current user
      if (updatedByUserId === currentUserId) {
        return;
      }

      // Skip if we're in the process of saving
      if (isSaving) {
        return;
      }

      // Skip if we're already processing an update
      if (processingUpdateRef.current) {
        return;
      }

      // Skip if emailId is null
      if (emailId === null) {
        return;
      }

      // Set processing flag
      processingUpdateRef.current = true;

      try {
        const { data: blocks, error } = await supabase
          .from("email_blocks")
          .select("*")
          .eq("email_id", emailId)
          .order("order", { ascending: true });

        if (error) {
          console.error("Error fetching updated blocks:", error);
          return;
        }

        if (blocks && blocks.length > 0) {
          // Convert database blocks to app blocks and call the callback
          const appBlocks = convertDatabaseBlocksToAppBlocks(
            blocks as DatabaseBlock[],
          );
          onBlocksChange(appBlocks);
        }
      } catch (error) {
        console.error("Error processing block changes:", error);
      } finally {
        // Clear processing flag
        processingUpdateRef.current = false;
      }
    }, 300),
    [emailId, currentUserId, onBlocksChange, isSaving, supabase],
  );

  useEffect(() => {
    if (!emailId || !currentUserId) return;

    // Create a channel to listen for changes on the email_blocks table
    const channel = supabase
      .channel(`email-blocks-changes-${emailId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "email_blocks",
          filter: `email_id=eq.${emailId}`,
        },
        async (payload) => {
          // Create a unique identifier for this update
          const timestamp = payload.commit_timestamp || Date.now().toString();
          const updateId = `${emailId}-${timestamp}`;

          // Skip if we've already processed this exact update
          if (updateId === lastProcessedUpdateRef.current) {
            return;
          }

          // Store this update ID to avoid processing duplicates
          lastProcessedUpdateRef.current = updateId;

          // Get the user who made the update (if available)
          const updatedByUserId =
            payload.new &&
            typeof payload.new === "object" &&
            "updated_by" in payload.new
              ? (payload.new.updated_by as string | null)
              : null;

          // Use the debounced handler to prevent multiple rapid updates
          debouncedFetchAndProcessBlocks(updateId, updatedByUserId);
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to email blocks changes for email ID: ${emailId}`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `Failed to subscribe to email blocks changes for email ID: ${emailId}`,
          );
        }
      });

    // Cleanup function
    return () => {
      debouncedFetchAndProcessBlocks.cancel();
      channel.unsubscribe();
    };
  }, [emailId, currentUserId, debouncedFetchAndProcessBlocks]);

  // This component doesn't render anything
  return null;
}
