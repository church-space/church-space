import type { Client, Json } from "../types";
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

export async function updateOrganization(
  supabase: Client,
  organization: {
    organizationId: string;
    name: string;
    defaultEmail: string;
    defaultEmailDomain: number | null;
    address: Json;
  }
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("organizations")
    .update({
      name: organization.name,
      default_email: organization.defaultEmail,
      default_email_domain: organization.defaultEmailDomain,
      address: organization.address,
    })
    .eq("id", organization.organizationId)
    .select();

  if (result.error) {
    console.error(result.error);
  }

  return result;
}

export async function cancelInvite(supabase: Client, inviteId: number) {
  const result = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .select();

  if (result.error) {
    console.error(result.error);
  }

  return result;
}

export async function updateOrganizationMember(
  supabase: Client,
  memberId: number,
  role: string
) {
  const result = await supabase
    .from("organization_memberships")
    .update({ role })
    .eq("id", memberId)
    .select();

  if (result.error) {
    console.error(result.error);
  }

  return result;
}

export async function removeOrganizationMember(
  supabase: Client,
  memberId: number
) {
  const result = await supabase
    .from("organization_memberships")
    .delete()
    .eq("id", memberId)
    .select();

  if (result.error) {
    console.error(result.error);
  }

  return result;
}

export async function updateOrganizationAddress(
  supabase: Client,
  organization: {
    organizationId: string;
    address: Json;
  }
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("organizations")
    .update({
      address: organization.address,
    })
    .eq("id", organization.organizationId)
    .select();

  if (result.error) {
    console.error(result.error);
  }

  return result;
}
