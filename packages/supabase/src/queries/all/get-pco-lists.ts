import { Client } from "../../types";

export async function getPcoListsQuery(
  supabase: Client,
  organizationId: string,
  search?: string
) {
  let query = supabase
    .from("pco_lists")
    .select("*, pco_list_categories!left(pco_name)")
    .eq("organization_id", organizationId);

  if (search && search.trim() !== "") {
    query = query.ilike("pco_list_description", `%${search.trim()}%`);
  }

  // Apply limit after search
  query = query.limit(5);

  const { data, error } = await query;

  console.log("Query params:", {
    organizationId,
    search,
    searchTrimmed: search?.trim(),
  });
  console.log("Query results:", {
    data,
    error,
    count: data?.length,
  });

  return { data, error };
}

export async function getPcoListQuery(supabase: Client, listId: number) {
  let query = supabase.from("pco_lists").select("*").eq("id", listId);

  const { data, error } = await query;

  return { data, error };
}
