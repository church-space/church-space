import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "../../clients/server";
import { getPublicQRCode } from "../all/get-public-qr-code";

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
      revalidate: 1,
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
