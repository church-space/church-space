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

export async function deleteQRCode(supabase: Client, qrCodeId: string) {
  const { data, error } = await supabase
    .from("qr_codes")
    .delete()
    .eq("id", qrCodeId);

  return { data, error };
}

export async function updateQRCode(
  supabase: Client,
  qrCodeId: string,
  qrCode: Database["public"]["Tables"]["qr_codes"]["Update"]
) {
  const { data, error } = await supabase
    .from("qr_codes")
    .update(qrCode)
    .eq("id", qrCodeId);

  return { data, error };
}

export async function updateQRLink(
  supabase: Client,
  qrLink: Database["public"]["Tables"]["qr_links"]["Update"],
  qrLinkId: number
) {
  const { data, error } = await supabase
    .from("qr_links")
    .update(qrLink)
    .eq("id", qrLinkId)
    .select();
  return { data, error };
}

export async function createQRLink(
  supabase: Client,
  qrLink: Database["public"]["Tables"]["qr_links"]["Insert"]
) {
  const { data, error } = await supabase
    .from("qr_links")
    .insert(qrLink)
    .select();
  return { data, error };
}

export async function deleteQRLink(supabase: Client, qrLinkId: number) {
  const { data, error } = await supabase
    .from("qr_links")
    .delete()
    .eq("id", qrLinkId)
    .select();
  return { data, error };
}

export async function updateQRLinkStatus(
  supabase: Client,
  qrLinkId: number,
  status: "active" | "inactive"
) {
  const { data, error } = await supabase
    .from("qr_links")
    .update({ status })
    .eq("id", qrLinkId)
    .select();
  return { data, error };
}
