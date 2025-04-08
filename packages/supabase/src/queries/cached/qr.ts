import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getPublicQRCode } from "../all/get-public-qr-code";
import { DateFilter, getQRCodeClicksQuery } from "../all/get-qr-code";
import { getUserOrganizationId } from "../all/get-user-with-details";

export const getCachedPublicQRCode = async (qrCodeId: string) => {
  const supabase = await createClient();

  const response = await unstable_cache(
    async () => {
      const response = await getPublicQRCode(supabase, qrCodeId);
      if (!response) return null;
      return response;
    },
    [`qr_${qrCodeId}`],
    {
      revalidate: 3600,
    }
  )();

  if (!response) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [`qr_${qrCodeId}`],
    {
      tags: [`qr_${qrCodeId}`],
    }
  )();
};

export const getCachedQRCodeClicks = async (
  qrCodeIds: string[],
  qrLinkId: number,
  dateFilter: DateFilter = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: null,
  }
) => {
  const supabase = await createClient();

  const organizationId = await getUserOrganizationId(supabase);

  if (!organizationId) return null;

  const response = await unstable_cache(
    async () => {
      const response = await getQRCodeClicksQuery(
        supabase,
        qrCodeIds,
        dateFilter
      );
      if (!response) return null;
      return response;
    },
    [
      `qr_clicks_${organizationId}_${qrCodeIds.join("_")}_${dateFilter.year}_${dateFilter.month}_${dateFilter.day}`,
    ],
    {
      revalidate: 3600,
    }
  )();

  if (!response) return null;

  return unstable_cache(
    async () => {
      return response;
    },
    [
      `qr_clicks_${organizationId}_${qrCodeIds.join("_")}_${dateFilter.year}_${dateFilter.month}_${dateFilter.day}`,
    ],
    {
      tags: [`qr_clicks_${qrLinkId}`],
    }
  )();
};
