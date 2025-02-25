import type { Client } from "../types";

export async function updateEmailBlock(
  supabase: Client,
  blockId: number,
  updates: {
    type?:
      | "cards"
      | "button"
      | "text"
      | "divider"
      | "video"
      | "file-download"
      | "image"
      | "spacer"
      | "list"
      | "author";
    value?: any;
    order?: number | null;
    linked_file?: string | null;
  }
) {
  const result = await supabase
    .from("email_blocks")
    .update(updates)
    .eq("id", blockId)
    .select();

  return result;
}

export async function insertEmailBlock(
  supabase: Client,
  data: {
    type:
      | "cards"
      | "button"
      | "text"
      | "divider"
      | "video"
      | "file-download"
      | "image"
      | "spacer"
      | "list"
      | "author";
    value?: any;
    order?: number | null;
    linked_file?: string | null;
    email_id: number; // Required field from the table structure
  }
) {
  const result = await supabase.from("email_blocks").insert(data).select();

  return result;
}

export async function deleteEmailBlock(supabase: Client, blockId: number) {
  const result = await supabase
    .from("email_blocks")
    .delete()
    .eq("id", blockId)
    .select();

  return result;
}

export async function updateEmailStyle(
  supabase: Client,
  emailId: number,
  updates: {
    bg_color?: string;
    footer_bg_color?: string;
    footer_font?: string;
    footer_text_color?: string;
  }
) {
  const result = await supabase
    .from("emails")
    .update(updates)
    .eq("id", emailId)
    .select();

  return result;
}
