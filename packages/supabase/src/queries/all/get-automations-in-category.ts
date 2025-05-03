import { Client } from "../../types";

export async function getAutomationsInCategory(
  supabase: Client,
  categoryId: number
) {
  const { data, error } = await supabase
    .from("email_automations")
    .select("id, name")
    .eq("email_category_id", categoryId)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return {
    data,
    error,
  };
}
