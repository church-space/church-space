import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface UpdateOrgDefaultFooterParams {
  organizationId: string;
  updates: {
    name?: string | null;
    subtitle?: string | null;
    logo?: string | null;
    links?: any | null;
    socials_color?: string | null;
    socials_style?: "outline" | "filled" | "icon-only";
    socials_icon_color?: string | null;
  };
}

export function useUpdateOrgDefaultFooter() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      updates,
    }: UpdateOrgDefaultFooterParams) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      // Perform an upsert operation
      const { data, error } = await supabase
        .from("email_org_default_footer_values")
        .upsert(
          {
            organization_id: organizationId,
            ...updates,
          },
          {
            onConflict: "organization_id", // Assumes unique constraint on organization_id
          },
        )
        .select()
        .single();

      if (error) {
        // Add more specific error handling if needed
        console.error("Supabase upsert error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the organization default footer query
      queryClient.invalidateQueries({
        queryKey: ["orgDefaultFooter", variables.organizationId],
      });
    },
  });
}
