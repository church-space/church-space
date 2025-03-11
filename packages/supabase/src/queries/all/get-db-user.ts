import { Client } from "../../types";

export async function getDbUserQuery(supabase: Client, userId: string) {
  const { data: userDetails, error: userDetailsError } = await supabase
    .from("users")
    .select("first_name, last_name, avatar_url")
    .eq("id", userId);

  if (userDetailsError) {
    throw userDetailsError;
  }

  return {
    userDetails: userDetails[0],
  };
}
