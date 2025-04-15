"use server";

import { createClient } from "@church-space/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut({
    scope: "local",
  });

  return redirect("/homepage");
}
