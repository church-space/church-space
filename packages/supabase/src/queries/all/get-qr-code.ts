import { Client } from "../../types";

// Database types
type DBQRLink = {
  id: number;
  created_at: string;
  organization_id: string;
  url: string | null;
  title: string | null;
  status: string | null;
  qr_codes: DBQRCode[];
};

type DBQRCode = {
  id: string;
  created_at: string;
  title: string | null;
  qr_link_id: number;
  linked_asset: string | null;
  style: {
    bgColor?: string;
    qrColor?: string;
    isRounded?: boolean;
    isTransparent?: boolean;
    logoImage?: string | null;
    logoSize?: number;
  } | null;
};

// Component types
type QRCodeData = {
  id: string;
  name: string;
  bgColor: string;
  qrColor: string;
  isRounded: boolean;
  isTransparent: boolean;
  logoImage: string | null;
  logoSize: number;
  clicks: ClickData[];
};

type ClickData = {
  timestamp: string;
  count: number;
};

type LinkData = {
  url: string;
  name: string;
  qrCodes: QRCodeData[];
};

function mapDBToComponentData(dbData: DBQRLink): LinkData {
  return {
    url: dbData.url || "",
    name: dbData.title || "Untitled Link",
    qrCodes: dbData.qr_codes.map((qrCode) => ({
      id: qrCode.id,
      name: qrCode.title || "Untitled QR Code",
      bgColor: qrCode.style?.bgColor || "#FFFFFF",
      qrColor: qrCode.style?.qrColor || "#000000",
      isRounded: qrCode.style?.isRounded || false,
      isTransparent: qrCode.style?.isTransparent || false,
      logoImage: qrCode.style?.logoImage || null,
      logoSize: qrCode.style?.logoSize || 50,
      clicks: [], // We'll handle clicks separately later
    })),
  };
}

export async function getQRLinkQuery(supabase: Client, qrLinkId: number) {
  const { data, error } = await supabase
    .from("qr_links")
    .select(
      `
      *,
      qr_codes (*)
    `
    )
    .eq("id", qrLinkId)
    .single();

  if (error) {
    return { data: null, error };
  }

  const mappedData = mapDBToComponentData(data as DBQRLink);
  return { data: mappedData, error: null };
}
