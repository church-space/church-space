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

export type DateFilter = {
  year: number;
  month: number | null;
  day: number | null;
};

export type QRCodeClick = {
  id: number;
  created_at: string;
  qr_code_id: string;
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

export async function getQRCodeClicksQuery(
  supabase: Client,
  qrCodeIds: string[],
  dateFilter: DateFilter = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: null,
  }
) {
  let query = supabase
    .from("qr_code_clicks")
    .select("*")
    .in("qr_code_id", qrCodeIds);

  // Create date range based on filter
  let startDate: Date;
  let endDate: Date;

  if (dateFilter.day !== null && dateFilter.month !== null) {
    // Day view - show specific day
    startDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
    endDate = new Date(
      dateFilter.year,
      dateFilter.month - 1,
      dateFilter.day + 1
    );
  } else if (dateFilter.month !== null) {
    // Month view - show specific month
    startDate = new Date(dateFilter.year, dateFilter.month - 1, 1);
    endDate = new Date(dateFilter.year, dateFilter.month, 0); // Last day of the month
  } else {
    // Year view - show entire year
    startDate = new Date(dateFilter.year, 0, 1);
    endDate = new Date(dateFilter.year + 1, 0, 1);
  }

  // Add date range filter
  query = query
    .gte("created_at", startDate.toISOString())
    .lt("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  const { data, error } = await query;

  return { data: data as QRCodeClick[] | null, error };
}
