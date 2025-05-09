import { Client } from "../../types";

type DatabaseLinkListLink = {
  id: bigint;
  created_at: string;
  link_list_id: bigint;
  text: string | null;
  url: string | null;
  type: string | null;
  order: number | null;
};

type DatabaseLinkListSocial = {
  id: bigint;
  created_at: string;
  icon: string | null;
  url: string | null;
  order: number | null;
  link_list: bigint;
};

type DatabaseLinkList = {
  id: bigint;
  created_at: string;
  title: string | null;
  is_public: boolean;
  description: string | null;
  name: string | null;
  logo_asset: string | null;
  bg_image: string | null;
  style: Record<string, any> | null;
  primary_button: Record<string, any> | null;
  organization_id: string;
  url_slug: string | null;
  private_name: string | null;
  link_list_links: DatabaseLinkListLink[];
  link_list_socials: DatabaseLinkListSocial[];
};

export async function getLinkListQuery(
  supabase: Client,
  linkListId: number,
  organizationId: string
) {
  const { data, error } = await supabase
    .from("link_lists")
    .select(
      `
      id,
      created_at,
      title,
      is_public,
      description,
      name,
      logo_asset,
      bg_image,
      style,
      primary_button,
      organization_id,
      url_slug,
      private_name,
      link_list_links(id, created_at, text, url, type, order),
      link_list_socials(id, created_at, icon, url, order)
    `
    )
    .eq("id", linkListId)
    .eq("organization_id", organizationId)
    .single();

  // Sort the links and social links by their order field
  if (data) {
    if (data.link_list_links) {
      data.link_list_links.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
    }

    if (data.link_list_socials) {
      data.link_list_socials.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
    }
  }

  return { data: data as DatabaseLinkList | null, error };
}

export async function getLinkListBySlugQuery(
  supabase: Client,
  linkListSlug: string
) {
  const { data, error } = await supabase
    .from("link_lists")
    .select(
      `
      id,
      created_at,
      title,
      is_public,
      description,
      name,
      logo_asset,
      bg_image,
      style,
      primary_button,
      organization_id,
      url_slug,
      private_name,
      link_list_links(id, created_at, text, url, type, order),
      link_list_socials(id, created_at, icon, url, order)
    `
    )
    .eq("url_slug", linkListSlug)
    .single();

  // Sort the links and social links by their order field
  if (data) {
    if (data.link_list_links) {
      data.link_list_links.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
    }

    if (data.link_list_socials) {
      data.link_list_socials.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
    }
  }

  return { data: data as DatabaseLinkList | null, error };
}
