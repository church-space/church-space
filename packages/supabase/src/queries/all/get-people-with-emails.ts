import { Client } from "../../types";

export async function getPeopleWithEmailsAndSubscriptionStatus(
  supabase: Client,
  organizationId: string
) {
  const { data, error } = await supabase
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
      email_category_unsubscribes(
        id,
        email_address,
        reason,
        category_id,
        email_categories(
          id,
          name
        )
      )
    `
    )
    .order("last_name", { ascending: false })
    .eq("organization_id", organizationId);

  console.log(data);

  return { data, error };
}

// Keep the old function name for backward compatibility
export async function getEmailsQuery(supabase: Client, organizationId: string) {
  return getPeopleWithEmailsAndSubscriptionStatus(supabase, organizationId);
}
