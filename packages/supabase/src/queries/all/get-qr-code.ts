import { Client } from "../../types";

type DatabaseQRCode = {
  id: string;
  created_at: string;
  title: string | null;
  linked_asset: string | null;
  style: {
    bgColor?: string;
    qrColor?: string;
    isRounded?: boolean;
    isTransparent?: boolean;
    logoSize?: number;
  } | null;
};

type DatabaseQRLink = {
  id: number;
  created_at: string;
  organization_id: string;
  url: string | null;
  name: string | null;
  status: string | null;
  qr_codes: DatabaseQRCode[];
};

export async function getQRLinkQuery(supabase: Client, qrLinkId: number) {
  const { data, error } = await supabase
    .from("qr_links")
    .select(
      `
      id,
      created_at,
      organization_id,
      url,
      name,
      status,
      qr_codes (
        id,
        created_at,
        title,
        linked_asset,
        style
      )
    `
    )
    .eq("id", qrLinkId)
    .single();

  return { data: data as DatabaseQRLink | null, error };
}
