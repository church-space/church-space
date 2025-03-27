import type { Client, Database } from "../types";

export async function createQRCode(
  supabase: Client,
  qrCode: Database["public"]["Tables"]["qr_codes"]["Insert"]
) {
  const { data, error } = await supabase
    .from("qr_codes")
    .insert(qrCode)
    .select();
  return { data, error };
}
