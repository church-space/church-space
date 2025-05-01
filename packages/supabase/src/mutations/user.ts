import type { Client, Json } from "../types";

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
    .eq("id", userId)
    .select();
}

export async function deleteUser(supabase: Client, userId: string) {
  return supabase.auth.admin.deleteUser(userId);
}

export async function updateUserPreferences(
  supabase: Client,
  userId: string,
  preferences: Json
) {
  return supabase
    .from("users")
    .update({
      preferences,
    })
    .eq("id", userId)
    .select();
}
