import { Client } from "../../types";

export interface QueryParams {
  start?: number;
  end?: number;
  emailStatus?: (
    | "subscribed"
    | "partially subscribed"
    | "pco_blocked"
    | "unsubscribed"
    | "cleaned"
  )[];
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
        status,
        pco_person_id,
        organization_id,
        reason, 
        protected_from_cleaning
      ),
      email_list_category_unsubscribes(
        id,
        email_address,
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
    // For partially subscribed, we need to check both status and unsubscribes
    if (params.emailStatus.includes("partially subscribed")) {
      query = query.eq("people_emails.status", "subscribed");
      query = query.not("email_list_category_unsubscribes.id", "is", null);
    } else {
      // Filter out "partially subscribed" from the status array since it's not a valid database status
      const validStatuses = params.emailStatus.filter(
        (
          status
        ): status is
          | "subscribed"
          | "unsubscribed"
          | "pco_blocked"
          | "cleaned" => status !== "partially subscribed"
      );
      if (validStatuses.length > 0) {
        query = query.in("people_emails.status", validStatuses);
      }
    }
  }

  if (params?.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
    );
    query = query.filter("people_emails.email", "ilike", searchTerm);
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
    // Request one extra item to determine if there's a next page
    query = query.range(params.start, params.end + 1);
  }

  const { data, error } = await query;
  return { data, error };
}

// Keep the old function name for backward compatibility
export async function getEmailsQuery(supabase: Client, organizationId: string) {
  return getPeopleWithEmailsAndSubscriptionStatus(supabase, organizationId);
}
