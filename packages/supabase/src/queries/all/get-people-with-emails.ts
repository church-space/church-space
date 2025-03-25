import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  emailStatus?: ("subscribed" | "pco_blocked" | "unsubscribed")[];
  searchTerm?: string;
  unsubscribedCategories?: number[];
}

export async function getPeopleCount(
  supabase: Client,
  organizationId: string,
  params?: QueryParams
) {
  let query = supabase
    .from("people")
    .select(
      `
      id,
      people_emails!inner(status)
    `,
      { count: "exact", head: true }
    )
    .eq("organization_id", organizationId);

  // Apply filters if provided
  if (params?.emailStatus && params.emailStatus.length > 0) {
    query = query.in("people_emails.status", params.emailStatus);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},` +
        `last_name.ilike.${searchTerm},` +
        `concat(first_name, ' ', last_name).ilike.${searchTerm},` +
        `people_emails.email.ilike.${searchTerm}`
    );
  }

  if (
    params?.unsubscribedCategories &&
    params.unsubscribedCategories.length > 0
  ) {
    query = query.in(
      "email_list_category_unsubscribes.pco_list_category",
      params.unsubscribedCategories
    );
  }

  const { count, error } = await query;
  return { count, error };
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
        status,
        pco_person_id,
        organization_id
      ),
      email_list_category_unsubscribes(
        id,
        email_address,
        reason,
        pco_list_category,
        pco_list_categories(
          id,
          pco_name, 
          pco_id
        )
      )
    `
    )
    .order("first_name", { ascending: true })
    .eq("organization_id", organizationId);

  // Apply filters if provided
  if (params?.emailStatus && params.emailStatus.length > 0) {
    query = query.in("people_emails.status", params.emailStatus);
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},` +
        `last_name.ilike.${searchTerm},` +
        `concat(first_name, ' ', last_name).ilike.${searchTerm},` +
        `people_emails.email.ilike.${searchTerm}`
    );
  }

  if (
    params?.unsubscribedCategories &&
    params.unsubscribedCategories.length > 0
  ) {
    query = query.in(
      "email_list_category_unsubscribes.pco_list_category",
      params.unsubscribedCategories
    );
  }

  // Apply pagination if provided
  if (params?.start !== undefined && params?.end !== undefined) {
    query = query.range(params.start, params.end);
  }

  const { data, error } = await query;

  console.log(data);
  console.log(error);

  return { data, error };
}

// Keep the old function name for backward compatibility
export async function getEmailsQuery(supabase: Client, organizationId: string) {
  return getPeopleWithEmailsAndSubscriptionStatus(supabase, organizationId);
}
