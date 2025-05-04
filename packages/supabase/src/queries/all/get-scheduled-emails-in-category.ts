import { Client } from "../../types";

export async function getScheduledEmailsInCategory(
  supabase: Client,
  categoryId: number
) {
  const { data, error } = await supabase
    .from("emails")
    .select("id, subject")
    .eq("email_category", categoryId)
    .eq("status", "scheduled");

  if (error) {
    throw error;
  }

  return {
    data,
    error,
  };
}
