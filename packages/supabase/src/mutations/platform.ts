import type { Client } from "../types";
import { getUserQuery } from "../queries/all/get-user";
import { revalidateTag } from "next/cache";

export async function updateUser(
  supabase: Client,
  user: {
    first_name: string;
    last_name: string;
  }
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("users")
    .update({ ...user, onboarded: true })
    .eq("id", userId)
    .select();

  // Invalidate the cache for this specific email
  if (!result.error) revalidateTag(`user_${userId}`);

  return result;
}
