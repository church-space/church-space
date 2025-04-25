import { Client } from "../../types";

export async function getBrandColorsQuery(supabase: Client, orgId: string) {
  const { data: colors, error: colorsError } = await supabase
    .from("brand_colors")
    .select("*")
    .eq("organization_id", orgId)
    .single();

  if (colorsError) {
    throw colorsError;
  }

  return {
    colors,
  };
}
