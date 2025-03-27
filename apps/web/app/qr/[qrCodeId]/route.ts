import { createClient } from "@church-space/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(2, "10s"),
  redis: RedisClient,
});

export async function GET(
  request: NextRequest,
  context: { params: { qrCodeId: string } },
) {
  try {
    const supabase = await createClient();

    // Get the QR code and its associated link
    const { data: qrCode, error: qrError } = await supabase
      .from("qr_codes")
      .select(
        `
        id,
        qr_links (
          url
        )
      `,
      )
      .eq("id", context.params.qrCodeId)
      .single();

    if (qrError || !qrCode || !qrCode.qr_links?.url) {
      return new NextResponse("QR Code not found or invalid", { status: 404 });
    }

    // Record the click
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`${ip}-qr-click`);

    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const { error: clickError } = await supabase.from("qr_code_clicks").insert([
      {
        qr_code_id: context.params.qrCodeId,
      },
    ]);

    if (clickError) {
      console.error("Error recording click:", clickError);
      // Continue with redirect even if click recording fails
    }

    // Redirect to the URL
    return NextResponse.redirect(qrCode.qr_links.url);
  } catch (error) {
    console.error("Error processing QR code:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
