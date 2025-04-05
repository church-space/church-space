"use server";

import { createClient } from "@church-space/supabase/server";

export async function handleUnsubscribe(
  emailId: number,
  peopleEmailId: number,
  pcoListCategory: number,
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("unsubscribe_from_email_category", {
    unsub_email_id: emailId,
    person_email_id: peopleEmailId,
    pco_list_category: pcoListCategory,
  });

  if (error) {
    console.error("Error unsubscribing from category:", error);
    throw error;
  }
}
