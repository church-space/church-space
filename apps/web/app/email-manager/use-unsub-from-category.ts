"use server";

import { createClient } from "@church-space/supabase/server";

export async function handleUnsubscribe(
  emailId: number,
  peopleEmailId: number,
) {
  const supabase = await createClient();
}
