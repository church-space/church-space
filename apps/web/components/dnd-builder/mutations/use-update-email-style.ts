import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface StyleUpdates {
  blocks_bg_color?: string;
  default_text_color?: string;
  accent_text_color?: string;
  default_font?: string;
  is_inset?: boolean;
  bg_color?: string;
  is_rounded?: boolean;
  block_spacing?: number;
  link_color?: string;
}

interface UpdateEmailStyleParams {
  emailId: number;
  updates: StyleUpdates;
}

export function useUpdateEmailStyle() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ emailId, updates }: UpdateEmailStyleParams) => {
      // Get the current data from the cache
      const cachedData = queryClient.getQueryData(["email", emailId]) as any;
      const currentStyle = cachedData?.email?.style || {};

      console.log("Current style:", currentStyle);
      console.log("Incoming updates:", updates);

      // Create the updated style object by merging with current style
      const updatedStyle = {
        ...currentStyle,
        ...(updates.blocks_bg_color !== undefined && {
          blocks_bg_color: updates.blocks_bg_color,
        }),
        ...(updates.default_text_color !== undefined && {
          default_text_color: updates.default_text_color,
        }),
        ...(updates.accent_text_color !== undefined && {
          accent_text_color: updates.accent_text_color,
        }),
        ...(updates.default_font !== undefined && {
          default_font: updates.default_font,
        }),
        ...(updates.is_inset !== undefined && { is_inset: updates.is_inset }),
        ...(updates.bg_color !== undefined && { bg_color: updates.bg_color }),
        ...(updates.is_rounded !== undefined && {
          is_rounded: updates.is_rounded,
        }),
        ...(updates.link_color !== undefined && {
          link_color: updates.link_color,
        }),
        ...(updates.block_spacing !== undefined && {
          block_spacing: updates.block_spacing,
        }),
      };

      console.log("Updated style object:", updatedStyle);

      // Update the style column
      const { data, error } = await supabase
        .from("emails")
        .update({ style: updatedStyle })
        .eq("id", emailId)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Supabase response data:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log("Mutation success - updating cache with:", data);
      // Instead of invalidating the query which causes a refetch,
      // update the cached data directly
      queryClient.setQueryData(["email", variables.emailId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          email: {
            ...oldData.email,
            style: data.style,
          },
        };
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}
