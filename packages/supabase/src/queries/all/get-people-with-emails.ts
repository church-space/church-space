import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  searchTerm?: string;
  unsubscribedCategories?: number[];
}

export async function getPeopleWithEmailsAndSubscriptionStatus(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("people")
    .select(
      `
      id,
      first_name,
      middle_name,
      last_name,
      nickname,
      given_name,
      organization_id,
      pco_id,
      people_emails(
        id,
        email,
        pco_person_id,
        organization_id
      ),
      email_category_unsubscribes(
        id,
        email_address,
        category_id,
        email_categories(
          id,
          name
        )
      )
    `
    )
    .order("first_name", { ascending: true })
    .eq("organization_id", organizationId);

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
    );
  }

  if (
    params?.unsubscribedCategories &&
    params.unsubscribedCategories.length > 0
  ) {
    query = query.in(
      "email_category_unsubscribes.category_id",
      params.unsubscribedCategories
    );
  }

  // Apply pagination if provided
  if (params?.start !== undefined && params?.end !== undefined) {
    // Request one extra item to determine if there's a next page
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { data, error };
  }

  // Extract unique email addresses from the results
  const emailAddresses = Array.from(
    new Set(
      data.flatMap((person) => person.people_emails.map((email) => email.email))
    )
  );

  if (emailAddresses.length === 0) {
    // No emails found, return data as is (or potentially enrich emails with default status?)
    // For now, just return
    return { data, error };
  }

  // Fetch email statuses for the collected email addresses
  const { data: statusesData, error: statusesError } = await supabase
    .from("people_email_statuses")
    .select("email_address, status, reason, protected_from_cleaning")
    .eq("organization_id", organizationId)
    .in("email_address", emailAddresses);

  if (statusesError) {
    // Handle error fetching statuses - maybe log it or return partial data with error
    console.error("Error fetching email statuses:", statusesError);
    // Depending on requirements, you might still return the original data
    // return { data, error: statusesError }; // Or return original data + new error
    return { data, error: null }; // Return original data without status enrichment
  }

  // Create a map for quick lookup: email_address -> status details
  const statusMap = new Map(
    statusesData.map((status) => [
      status.email_address,
      {
        status: status.status,
        reason: status.reason,
        protected_from_cleaning: status.protected_from_cleaning,
      },
    ])
  );

  // Augment the original data with status information
  const augmentedData = data.map((person) => ({
    ...person,
    people_emails: person.people_emails.map((email) => ({
      ...email,
      ...(statusMap.get(email.email) || {
        status: "unknown", // Or 'subscribed' or null, depending on default
        reason: null,
        protected_from_cleaning: false,
      }), // Add status info, handle cases where status might be missing
    })),
  }));

  return { data: augmentedData, error };
}

export async function getSubscribedPeopleCount(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("people_email_statuses")
    .select("status")
    .eq("organization_id", organizationId)
    .eq("status", "subscribed");

  return data?.length;
}
// Keep the old function name for backward compatibility
export async function getEmailsQuery(supabase: Client, organizationId: string) {
  return getPeopleWithEmailsAndSubscriptionStatus(supabase, organizationId);
}
