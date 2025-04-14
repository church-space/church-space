import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@church-space/supabase/client";

interface UpdateOrgDefaultFooterParams {
  organizationId: string;
  updates: {
    name?: string | null;
    subtitle?: string | null;
    logo?: string | null;
    address?: string | null;
    reason?: string | null;
    copyright_name?: string | null;
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

      // Check if a default footer already exists for this organization
      const { data: existingFooter, error: checkError } = await supabase
        .from("email_org_default_footer_values")
        .select("id")
        .eq("organization_id", organizationId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let result;

      if (existingFooter) {
        // Update existing footer
        const { data, error } = await supabase
          .from("email_org_default_footer_values")
          .update(updates)
          .eq("id", existingFooter.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      } else {
        // Create new footer
        const { data, error } = await supabase
          .from("email_org_default_footer_values")
          .insert({
            organization_id: organizationId,
            ...updates,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        result = data;
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate the organization default footer query
      queryClient.invalidateQueries({
        queryKey: ["orgDefaultFooter", variables.organizationId],
      });
    },
  });
}
