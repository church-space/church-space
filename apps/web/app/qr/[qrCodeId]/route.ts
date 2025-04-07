import { createClient } from "@church-space/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { redirect } from "next/navigation";
import { getCachedPublicQRCode } from "@church-space/supabase/queries/cached/qr";

export const runtime = "edge";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(2, "10s"),
  redis: RedisClient,
});

export async function GET(
  request: NextRequest,
  context: { waitUntil: (promise: Promise<any>) => void },
) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const qrCodeId = pathParts[pathParts.length - 1];

    const supabase = await createClient();
    const qrCode = await getCachedPublicQRCode(qrCodeId);

    if (
      !qrCode ||
      !qrCode.qr_links?.url ||
      qrCode.qr_links.status !== "active"
    ) {
      redirect("/qr/not-found");
    }

    // Create the response immediately
    const response = NextResponse.redirect(qrCode.qr_links.url);

    // Handle rate limiting and click recording in the background
    context.waitUntil(
      (async () => {
        try {
          const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
          const { success } = await ratelimit.limit(`${ip}-qr-click`);

          if (success) {
            await supabase.from("qr_code_clicks").insert([
              {
                qr_code_id: qrCodeId,
              },
            ]);
          }
        } catch (error) {
          console.error("Background task error:", error);
        }
      })(),
    );

    return response;
  } catch (error) {
    console.error("Error processing QR code:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
