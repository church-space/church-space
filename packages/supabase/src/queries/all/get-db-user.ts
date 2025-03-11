import { Client } from "../../types";

export async function getDbUserQuery(supabase: Client, userId: string) {
  const { data: userDetails, error: userDetailsError } = await supabase
    .from("users")
    .select("first_name, last_name, email, image_url")
    .eq("id", userId)
    .single();

  if (userDetailsError) {
    throw userDetailsError;
  }

  return {
    userDetails,
  };
}
