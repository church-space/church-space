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

export async function deleteUser(supabase: Client, userId: string) {
  return supabase.auth.admin.deleteUser(userId);
}
