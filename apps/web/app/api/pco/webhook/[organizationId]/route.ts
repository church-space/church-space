import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();

  // Use these more explicit logging methods:
  console.log("=== Webhook Request Start ===");
  console.log(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        path: request.url,
        data: data,
      },
      null,
      2
    )
  );
  console.log("=== Webhook Request End ===");

  return NextResponse.json({ received: true });
}
