import { sendBulkEmails } from "@/jobs/send-bulk-emails-queue";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request format
    if (!body.emailId || typeof body.emailId !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid emailId" },
        { status: 400 },
      );
    }

    if (
      !body.recipients ||
      typeof body.recipients !== "object" ||
      Object.keys(body.recipients).length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid recipients" },
        { status: 400 },
      );
    }

    // Verify email exists and is in a valid state
    const supabase = await createClient();
    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .select("status, scheduled_for")
      .eq("id", body.emailId)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Check email status
    if (emailData.status === "sent") {
      return NextResponse.json(
        { error: "Email has already been sent" },
        { status: 400 },
      );
    }

    if (emailData.status === "draft") {
      return NextResponse.json(
        { error: "Cannot send email in draft status" },
        { status: 400 },
      );
    }

    // Check scheduled time if applicable
    if (emailData.scheduled_for) {
      const scheduledTime = new Date(emailData.scheduled_for);
      const now = new Date();
      if (scheduledTime > now) {
        return NextResponse.json(
          { error: "Email is scheduled for future delivery" },
          { status: 400 },
        );
      }
    }

    // Trigger the bulk email sending job
    const result = await sendBulkEmails.trigger({
      emailId: body.emailId,
      recipients: body.recipients,
    });

    return NextResponse.json({
      message: "Emails queued successfully",
      result,
      recipientCount: Object.keys(body.recipients).length,
    });
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
      },
    );
  }
}
