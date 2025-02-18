import { Client } from "../../types";

export async function getUserQuery(supabase: Client) {
  return supabase.auth.getUser();
}
