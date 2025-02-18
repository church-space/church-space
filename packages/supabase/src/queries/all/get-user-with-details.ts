import { Client } from "../../types";

export async function getUserWithDetailsQuery(supabase: Client) {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    return null;
  }

  const { data: userDetails, error: userDetailsError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user?.id);

  if (userDetailsError) {
    throw userDetailsError;
  }

  return { user: data.user, userDetails };
}
