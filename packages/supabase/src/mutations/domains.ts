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

  return result;
}

export async function addDomain(
  supabase: Client,
  organizationId: string,
  domain: string,
  isPrimary: boolean = false,
  resendDomainId?: string,
  dnsRecords?: any[]
) {
  try {
    // First check if we have a valid user
    const authUser = await getUserQuery(supabase);

    const userId = authUser.data.user?.id;
    if (!userId) {
      console.error("No authenticated user found");
      return { data: null, error: new Error("No user found") };
    }

    // Validate inputs
    if (!organizationId || typeof organizationId !== "string") {
      console.error("Invalid organization ID", organizationId);
      return { data: null, error: new Error("Invalid organization ID") };
    }

    if (!domain || typeof domain !== "string") {
      console.error("Invalid domain", domain);
      return { data: null, error: new Error("Invalid domain") };
    }

    // Check if domain already exists
    const { data: existingDomains, error: checkError } = await supabase
      .from("domains")
      .select("id, domain")
      .eq("domain", domain)
      .eq("organization_id", organizationId);

    if (checkError) {
      console.error("Error checking existing domains:", checkError);
      return {
        data: null,
        error: new Error(
          `Error checking existing domains: ${checkError.message}`
        ),
      };
    }

    if (existingDomains && existingDomains.length > 0) {
      console.error("Domain already exists:", domain);
      return { data: null, error: new Error("Domain already exists") };
    }

    // Prepare the insert data with careful type handling
    const dnsRecordsJson = dnsRecords ? JSON.stringify(dnsRecords) : null;

    const insertData = {
      organization_id: organizationId,
      domain,
      is_primary: !!isPrimary, // Force boolean
      resend_domain_id: resendDomainId || null,
      dns_records: dnsRecordsJson,
    };

    // Perform the insert operation

    const result = await supabase.from("domains").insert(insertData).select();

    return result;
  } catch (error) {
    console.error("Unhandled error in addDomain:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error in addDomain: " + String(error)),
    };
  }
}
