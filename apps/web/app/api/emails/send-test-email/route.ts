import { sendEmails } from "@/jobs/test-email-queue";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.emails || !Array.isArray(body.emails)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const result = await sendEmails.trigger(body);
    return NextResponse.json({ message: "Emails queued successfully", result });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      {
        error: "Failed to queue emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
