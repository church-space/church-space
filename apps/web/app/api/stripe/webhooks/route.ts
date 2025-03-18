import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Stripe webhook received");
  return NextResponse.json({ message: "Stripe webhook received" });
}
