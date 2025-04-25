import type { Client, Json } from "../types";

export async function upsertBrandColor(
  supabase: Client,
  { organizationId, colors }: { organizationId: string; colors: Json }
) {
  const { data, error } = await supabase.from("brand_colors").upsert(
    {
      organization_id: organizationId,
      colors: colors,
    },
    {
      onConflict: "organization_id",
    }
  );

  if (error) {
    throw error;
  }

  return data;
}
