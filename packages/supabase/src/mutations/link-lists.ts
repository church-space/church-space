import type { Client, Database } from "../types";

export async function createLinkList(
  supabase: Client,
  linkList: Database["public"]["Tables"]["link_lists"]["Insert"]
) {
  const { data, error } = await supabase.from("link_lists").insert(linkList);
  return { data, error };
}

export async function updateLinkList(
  supabase: Client,
  linkList: Database["public"]["Tables"]["link_lists"]["Update"],
  linkListId: number
) {
  const { data, error } = await supabase
    .from("link_lists")
    .update(linkList)
    .eq("id", linkListId);
  return { data, error };
}

export async function deleteLinkList(supabase: Client, linkListId: number) {
  const { data, error } = await supabase
    .from("link_lists")
    .delete()
    .eq("id", linkListId);
  return { data, error };
}

export async function createLinkListLink(
  supabase: Client,
  linkListLink: Database["public"]["Tables"]["link_list_links"]["Insert"],
  linkListId: number
) {
  const { data, error } = await supabase
    .from("link_list_links")
    .insert(linkListLink);
  return { data, error };
}

export async function updateLinkListLink(
  supabase: Client,
  linkListLink: Database["public"]["Tables"]["link_list_links"]["Update"],
  linkListLinkId: number
) {
  const { data, error } = await supabase
    .from("link_list_links")
    .update(linkListLink)
    .eq("id", linkListLinkId);
  return { data, error };
}

export async function deleteLinkListLink(
  supabase: Client,
  linkListLinkId: number
) {
  const { data, error } = await supabase
    .from("link_list_links")
    .delete()
    .eq("id", linkListLinkId);
  return { data, error };
}

export async function createLinkListSocial(
  supabase: Client,
  linkListSocial: Database["public"]["Tables"]["link_list_socials"]["Insert"],
  linkListId: number
) {
  const { data, error } = await supabase
    .from("link_list_socials")
    .insert(linkListSocial);
  return { data, error };
}

export async function updateLinkListSocial(
  supabase: Client,
  linkListSocial: Database["public"]["Tables"]["link_list_socials"]["Update"],
  linkListSocialId: number
) {
  const { data, error } = await supabase
    .from("link_list_socials")
    .update(linkListSocial)
    .eq("id", linkListSocialId);
  return { data, error };
}

export async function deleteLinkListSocial(
  supabase: Client,
  linkListSocialId: number
) {
  const { data, error } = await supabase
    .from("link_list_socials")
    .delete()
    .eq("id", linkListSocialId);
  return { data, error };
}
