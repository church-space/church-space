import type { Client } from "../types";

export async function updateUser(
  supabase: Client,
  {
    userId,
    firstName,
    lastName,
  }: {
    userId: string;
    firstName: string;
    lastName: string;
  }
) {
  return supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", userId);
}
