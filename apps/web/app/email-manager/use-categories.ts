"use server";

import { createClient } from "@church-space/supabase/server";

export async function getCategories(emailId: number, peopleEmailId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_public_list_categories_with_unsub_status",
    {
      input_people_email_id: peopleEmailId,
      input_email_id: emailId,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}
