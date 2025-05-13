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

  // Fetch the user's organization membership and organization details
  const { data: organizationData, error: organizationError } = await supabase
    .from("organization_memberships")
    .select(
      `
        organization_id, 
        role,
        organizations!inner (
          id,
          name,
          finished_onboarding
        )
      `
    )
    .eq("user_id", data.user.id)
    .single();

  if (organizationError || !organizationData) {
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
    .eq("organization_id", organizationData.organization_id)
    .single();

  if (pcoConnectionError) {
    console.error("pcoConnectionError", pcoConnectionError);
  }

  return {
    user: data.user,
    userDetails,
    pcoConnection,
    organizationMembership: {
      organization_id: organizationData.organization_id,
      role: organizationData.role,
    },
    organization: {
      id: organizationData.organizations.id,
      name: organizationData.organizations.name,
      finished_onboarding: organizationData.organizations.finished_onboarding,
    },
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

export async function getUserAndOrganizationId(
  supabase: Client
): Promise<{ user: any; organizationId: string }> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("User not found");
  }

  const { data: organizationMemberships, error: membershipError } =
    await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", data.user.id);

  if (membershipError) {
    throw membershipError;
  }

  if (!organizationMemberships || organizationMemberships.length === 0) {
    throw new Error("No organization memberships found for user");
  }

  return {
    user: data.user,
    organizationId: organizationMemberships[0].organization_id,
  };
}
