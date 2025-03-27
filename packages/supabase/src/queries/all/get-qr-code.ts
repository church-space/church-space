import { Client } from "../../types";

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

  return { data, error };
}
