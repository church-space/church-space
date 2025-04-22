import { Client } from "../../types";

export async function getDomainsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getDomainQuery(supabase: Client, domainId: number) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("id", domainId);

  return { data, error };
}

export async function getVerifiedDomainsQuery(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_verified", true)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getVerifiedDomainQuery(
  supabase: Client,
  domainId: number
) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("id", domainId)
    .eq("is_verified", true);

  return { data, error };
}
