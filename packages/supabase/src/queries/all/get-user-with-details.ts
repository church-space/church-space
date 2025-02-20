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

  console.log("userDetails", userDetails);

  // Fetch the user's organization membership.
  const { data: organizationMembership, error: organizationMembershipError } =
    await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", data.user.id)
      .single();

  if (organizationMembershipError) {
    console.log("organizationMembershipError", organizationMembershipError);
  }

  console.log("organizationMembership", organizationMembership);

  if (!organizationMembership?.organization_id) {
    return { user: data.user, userDetails };
  }

  // Fetch the PCO connection for the user's organization.
  const { data: pcoConnection, error: pcoConnectionError } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", organizationMembership.organization_id)
    .single();

  if (pcoConnectionError) {
    console.log("pcoConnectionError", pcoConnectionError);
  }

  return {
    user: data.user,
    userDetails,
    pcoConnection,
    organizationMembership,
  };
}
