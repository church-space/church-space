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

  if (!userDetails?.[0]?.organization_id) {
    return { user: data.user, userDetails };
  }

  // Fetch the PCO connection for the user's organization.
  const { data: pcoConnection, error: pcoConnectionError } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", userDetails?.[0]?.organization_id)
    .single();

  if (pcoConnectionError) {
    throw pcoConnectionError;
  }

  return { user: data.user, userDetails, pcoConnection };
}
