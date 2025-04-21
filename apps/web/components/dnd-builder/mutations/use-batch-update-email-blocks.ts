import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

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
  | "author"
  | "audio"
  | "quiz";

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
        console.error("Batch update errors:", errors);
        throw new Error(`Failed to update ${errors.length} blocks`);
      }

      return { success: true, emailId, orderUpdates, contentUpdates };
    },
    onSuccess: (data) => {
      // Instead of invalidating the query, update the cache directly
      if (data && data.emailId) {
        queryClient.setQueryData(["email", data.emailId], (oldData: any) => {
          if (!oldData) return oldData;

          const updatedBlocks = [...oldData.blocks];

          // Apply order updates
          if (data.orderUpdates && data.orderUpdates.length > 0) {
            data.orderUpdates.forEach(({ id, order }: OrderUpdate) => {
              const blockIndex = updatedBlocks.findIndex(
                (block) => block.id === id,
              );
              if (blockIndex !== -1) {
                updatedBlocks[blockIndex] = {
                  ...updatedBlocks[blockIndex],
                  order,
                };
              }
            });
          }

          // Apply content updates
          if (data.contentUpdates && data.contentUpdates.length > 0) {
            data.contentUpdates.forEach(
              ({ id, type, value }: ContentUpdate) => {
                const blockIndex = updatedBlocks.findIndex(
                  (block) => block.id === id,
                );
                if (blockIndex !== -1) {
                  updatedBlocks[blockIndex] = {
                    ...updatedBlocks[blockIndex],
                    type,
                    value,
                  };
                }
              },
            );
          }

          return {
            ...oldData,
            blocks: updatedBlocks.sort((a, b) => a.order - b.order),
          };
        });
      }
    },
  });
}
