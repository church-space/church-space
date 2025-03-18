import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Stripe webhook received", request.body);
  return NextResponse.json({ message: "Stripe webhook received" });
}
