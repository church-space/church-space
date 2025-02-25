import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@trivo/supabase/client";
import type { BlockData } from "@/types/blocks";

// Define the database-compatible block types
type DatabaseBlockType =
  | "cards"
  | "button"
  | "text"
  | "divider"
  | "video"
  | "file-download"
  | "image"
  | "spacer"
  | "list"
  | "author";

// Define a simplified Json type that matches Supabase's Json type
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

interface OrderUpdate {
  id: number;
  order: number;
}

interface ContentUpdate {
  id: number;
  type?: DatabaseBlockType;
  value?: Json;
  order?: number;
  linked_file?: string | null;
}

interface BatchUpdateEmailBlocksParams {
  emailId: number;
  orderUpdates?: OrderUpdate[];
  contentUpdates?: ContentUpdate[];
}

export function useBatchUpdateEmailBlocks() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      orderUpdates = [],
      contentUpdates = [],
    }: BatchUpdateEmailBlocksParams) => {
      const updatePromises = [];

      // Process order updates (simple and fast)
      if (orderUpdates.length > 0) {
        const orderPromises = orderUpdates.map(({ id, order }) => {
          return supabase.from("email_blocks").update({ order }).eq("id", id);
        });

        updatePromises.push(...orderPromises);
      }

      // Process content updates (more complex)
      if (contentUpdates.length > 0) {
        const contentPromises = contentUpdates.map(({ id, ...updates }) => {
          return supabase.from("email_blocks").update(updates).eq("id", id);
        });

        updatePromises.push(...contentPromises);
      }

      // Execute all updates in parallel
      const results = await Promise.all(updatePromises);

      // Check if any updates failed
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} blocks`);
      }

      return { success: true, emailId };
    },
    onSuccess: (data) => {
      // Invalidate the email query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["email", data.emailId] });
    },
  });
}
