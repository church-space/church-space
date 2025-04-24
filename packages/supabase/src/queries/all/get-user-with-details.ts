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
    .eq("id", data.user?.id)
    .single();

  if (userDetailsError) {
    throw userDetailsError;
  }

  // Fetch the user's organization membership.
  const { data: organizationMembership, error: organizationMembershipError } =
    await supabase
      .from("organization_memberships")
      .select("organization_id, role")
      .eq("user_id", data.user.id)
      .single();

  if (organizationMembershipError || !organizationMembership) {
    // Return early if there's no organization membership or if there was an error
    return {
      user: data.user,
      userDetails: userDetails || null,
    };
  }

  // Fetch the PCO connection for the user's organization.
  const { data: pcoConnection, error: pcoConnectionError } = await supabase
    .from("pco_connections")
    .select("*")
    .eq("organization_id", organizationMembership.organization_id)
    .single();

  if (pcoConnectionError) {
    console.error("pcoConnectionError", pcoConnectionError);
  }

  return {
    user: data.user,
    userDetails,
    pcoConnection,
    organizationMembership,
  };
}

export async function getUserOrganizationId(supabase: Client) {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    return [];
  }

  const { data: organizationMemberships, error: membershipError } =
    await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", data.user.id);

  if (membershipError) {
    throw membershipError;
  }

  return organizationMemberships.map(
    (membership) => membership.organization_id
  );
}
