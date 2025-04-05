"use server";

import { createClient } from "@church-space/supabase/server";

export async function handleUnsubscribe(
  emailId: number,
  peopleEmailId: number,
) {
  const supabase = await createClient();
  await supabase.rpc("unsubscribe_from_all_emails", {
    p_email_id: emailId,
    p_person_email_id: peopleEmailId,
  });
  console.log("unsubscribed");
}
