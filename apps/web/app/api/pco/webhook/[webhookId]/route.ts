import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { webhookId: string } }
) {
  const headersList = headers();
  const data = await request.json();

  console.log("Webhook data:", data);

  // TODO verify signature
  // const signature = headersList.get("x-pco-signature");

  return NextResponse.json({ received: true });
}
