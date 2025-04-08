import type { Client, Database } from "../types";

export async function createLinkList(
  supabase: Client,
  linkList: Database["public"]["Tables"]["link_lists"]["Insert"]
) {
  const { data, error } = await supabase
    .from("link_lists")
    .insert(linkList)
    .select();
  return { data, error };
}

export async function updateLinkList(
  supabase: Client,
  linkList: Database["public"]["Tables"]["link_lists"]["Update"],
  linkListId: number
) {
  // Apply defaults to style if it exists
  if (linkList.style) {
    const defaultStyle = {
      backgroundColor: "#ffffff",
      buttonColor: "#000000",
      buttonTextColor: "#ffffff",
      socialsStyle: "filled",
      socialsColor: "#f7f7f7",
      socialsIconColor: "#000000",
      headerBgColor: "#f7f7f7",
      headerBlur: false,
      headerTextColor: "#000000",
      headerSecondaryTextColor: "#454545",
    };

    // Merge defaults with existing style, only using defaults for undefined values
    linkList.style = {
      ...defaultStyle,
      ...Object.fromEntries(
        Object.entries(linkList.style).filter(([_, v]) => v !== undefined)
      ),
    };
  }

  // Apply defaults to primary_button if it exists
  if (linkList.primary_button) {
    const defaultPrimaryButton = {
      text: "Plan your visit",
      color: "#000000",
      textColor: "#ffffff",
    };

    // Merge defaults with existing primary_button, only using defaults for undefined values
    linkList.primary_button = {
      ...defaultPrimaryButton,
      ...Object.fromEntries(
        Object.entries(linkList.primary_button).filter(
          ([_, v]) => v !== undefined
        )
      ),
    };
  }

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
