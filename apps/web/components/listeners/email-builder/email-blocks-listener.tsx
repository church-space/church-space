"use client";
import { createClient } from "@church-space/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Block, BlockType } from "@/types/blocks";
import { useUser } from "@/stores/use-user";
import { debounce } from "lodash";

// Generate a unique ID for this component instance
const generateInstanceId = () => {
  return Math.random().toString(36).substring(2, 9);
};

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
  const updateCountRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(generateInstanceId());

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
        console.log(
          `[Blocks:${instanceIdRef.current}] Update skipped - made by current user`,
          updatedByUserId,
        );
        return;
      }

      // Skip if we're in the process of saving
      if (isSaving) {
        console.log(
          `[Blocks:${instanceIdRef.current}] Update skipped - currently saving`,
        );
        return;
      }

      // Skip if we're already processing an update
      if (processingUpdateRef.current) {
        console.log(
          `[Blocks:${instanceIdRef.current}] Update skipped - already processing another update`,
        );
        return;
      }

      // Skip if emailId is null
      if (emailId === null) {
        console.log(
          `[Blocks:${instanceIdRef.current}] Update skipped - emailId is null`,
        );
        return;
      }

      // Increment update count
      updateCountRef.current += 1;
      console.log(
        `[Blocks:${instanceIdRef.current}] Processing update #${updateCountRef.current} at ${new Date().toLocaleTimeString()}`,
      );

      // Set processing flag
      processingUpdateRef.current = true;

      try {
        console.log(
          `[Blocks:${instanceIdRef.current}] Fetching updated blocks from database`,
        );
        const { data: blocks, error } = await supabase
          .from("email_blocks")
          .select("*")
          .eq("email_id", emailId)
          .order("order", { ascending: true });

        if (error) {
          console.error(
            `[Blocks:${instanceIdRef.current}] Error fetching updated blocks:`,
            error,
          );
          return;
        }

        if (blocks && blocks.length > 0) {
          console.log(
            `[Blocks:${instanceIdRef.current}] Found ${blocks.length} blocks to update`,
          );
          // Convert database blocks to app blocks and call the callback
          const appBlocks = convertDatabaseBlocksToAppBlocks(
            blocks as DatabaseBlock[],
          );
          onBlocksChange(appBlocks);
        } else {
          console.log(
            `[Blocks:${instanceIdRef.current}] No blocks found for this email`,
          );
        }
      } catch (error) {
        console.error(
          `[Blocks:${instanceIdRef.current}] Error processing block changes:`,
          error,
        );
      } finally {
        // Clear processing flag
        processingUpdateRef.current = false;
        console.log(
          `[Blocks:${instanceIdRef.current}] Finished processing blocks update`,
        );
      }
    }, 300),
    [emailId, currentUserId, onBlocksChange, isSaving, supabase],
  );

  useEffect(() => {
    if (!emailId || !currentUserId) return;

    console.log(
      `[Blocks:${instanceIdRef.current}] Setting up listener for email ID: ${emailId}, user ID: ${currentUserId}`,
    );

    // Create a channel to listen for changes on the email_blocks table
    const channel = supabase
      .channel(`email-blocks-changes-${emailId}-${instanceIdRef.current}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "email_blocks",
          filter: `email_id=eq.${emailId}`,
        },
        async (payload) => {
          console.log(
            `[Blocks:${instanceIdRef.current}] Change detected at ${new Date().toLocaleTimeString()}`,
            {
              event: payload.eventType,
              table: payload.table,
              schema: payload.schema,
            },
          );

          // Create a unique identifier for this update
          const timestamp = payload.commit_timestamp || Date.now().toString();
          const updateId = `${emailId}-${timestamp}`;

          // Skip if we've already processed this exact update
          if (updateId === lastProcessedUpdateRef.current) {
            console.log(
              `[Blocks:${instanceIdRef.current}] Skipping duplicate update`,
              updateId,
            );
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

          console.log(
            `[Blocks:${instanceIdRef.current}] Queueing update for processing`,
            {
              updateId,
              updatedBy: updatedByUserId,
              currentUser: currentUserId,
              isSame: updatedByUserId === currentUserId,
            },
          );

          // Use the debounced handler to prevent multiple rapid updates
          debouncedFetchAndProcessBlocks(updateId, updatedByUserId);
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log(
            `[Blocks:${instanceIdRef.current}] Subscribed to email blocks changes for email ID: ${emailId}`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `[Blocks:${instanceIdRef.current}] Failed to subscribe to email blocks changes for email ID: ${emailId}`,
          );
        }
      });

    // Cleanup function
    return () => {
      console.log(
        `[Blocks:${instanceIdRef.current}] Cleaning up listener for email ID: ${emailId}`,
      );
      debouncedFetchAndProcessBlocks.cancel();
      channel.unsubscribe();
    };
  }, [emailId, currentUserId, debouncedFetchAndProcessBlocks]);

  // This component doesn't render anything
  return null;
}
