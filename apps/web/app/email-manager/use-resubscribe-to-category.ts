"use server";

import { createClient } from "@church-space/supabase/server";

export async function handleCategoryResubscribe(
  peopleEmailId: number,
  categoryId: number,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_list_category_unsubscribes")
    .delete()
    .eq("people_email_id", peopleEmailId)
    .eq("category_id", categoryId);

  if (error) {
    throw error;
  }

  return data;
}
