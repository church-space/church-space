import type { Client, Database } from "../types";
import { revalidateTag } from "next/cache";

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

  if (data) {
    revalidateTag(`qr_${qrCodeId}`);
  }

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

  if (data) {
    revalidateTag(`qr_${qrCodeId}`);
  }

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

  if (data) {
    const { data: qrCodeData } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("qr_link_id", qrLinkId);

    if (qrCodeData) {
      qrCodeData.forEach((qrCode) => {
        revalidateTag(`qr_${qrCode.id}`);
      });
    }
  }

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

  if (!data || !data[0]) {
    return { data: null, error: "No data returned from QR link creation" };
  }

  const { data: qrCodeData, error: qrCodeError } = await supabase
    .from("qr_codes")
    .insert({
      title: qrLink.name,
      qr_link_id: data[0].id,
    })
    .select();

  return { data, error, qrCodeData, qrCodeError };
}

export async function deleteQRLink(supabase: Client, qrLinkId: number) {
  const { data: qrCodeData } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("qr_link_id", qrLinkId);

  const { data, error } = await supabase
    .from("qr_links")
    .delete()
    .eq("id", qrLinkId)
    .select();

  if (qrCodeData) {
    qrCodeData.forEach((qrCode) => {
      revalidateTag(`qr_${qrCode.id}`);
    });
  }

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

  if (data) {
    const { data: qrCodeData } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("qr_link_id", qrLinkId);

    if (qrCodeData) {
      qrCodeData.forEach((qrCode) => {
        revalidateTag(`qr_${qrCode.id}`);
      });
    }
  }
  return { data, error };
}
