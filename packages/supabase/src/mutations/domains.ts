import { revalidateTag } from "next/cache";
import { getUserQuery } from "../queries/all/get-user";
import type { Client, Database } from "../types";

export async function deleteDomain(
  supabase: Client,
  organizationId: string,
  domainId: number
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("domains")
    .delete()
    .eq("id", domainId)
    .eq("organization_id", organizationId);

  // Invalidate the cache for this specific email
  if (!result.error) revalidateTag(`domains_${organizationId}`);

  return result;
}

export async function updateDomain(
  supabase: Client,
  domainId: number,
  domainData: Partial<Database["public"]["Tables"]["domains"]["Update"]>
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("domains")
    .update(domainData)
    .eq("id", domainId)
    .select();

  // Invalidate the cache for this specific domain
  if (!result.error && result.data?.[0]) {
    revalidateTag(`domains_${result.data[0].organization_id}`);
  }

  return result;
}

export async function addDomain(
  supabase: Client,
  organizationId: string,
  domain: string,
  isPrimary: boolean = false
) {
  const authUser = await getUserQuery(supabase);
  const userId = authUser.data.user?.id;

  if (!userId) return { data: null, error: new Error("No user found") };

  const result = await supabase
    .from("domains")
    .insert({
      organization_id: organizationId,
      domain,
      is_primary: isPrimary,
    })
    .select();

  // Invalidate the cache for domains in this organization
  if (!result.error) revalidateTag(`domains_${organizationId}`);

  return result;
}
