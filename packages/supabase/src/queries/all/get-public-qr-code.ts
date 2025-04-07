import { Client } from "../../types";

export async function getPublicQRCode(supabase: Client, qrCodeId: string) {
  // Get the QR code and its associated link
  const { data: qrCode, error: qrError } = await supabase
    .from("qr_codes")
    .select(
      `
        id,
        qr_links (
          url, 
          status
        )
      `
    )
    .eq("id", qrCodeId)
    .single();

  return qrCode;
}
