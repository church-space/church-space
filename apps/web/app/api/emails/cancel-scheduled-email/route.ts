import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { runs } from "@trigger.dev/sdk/v3";

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

    // Verify email exists and is in a valid state
    const supabase = await createClient();
    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .select("status, trigger_dev_schduled_id")
      .eq("id", body.emailId)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Check if email is scheduled
    if (emailData.status !== "scheduled") {
      return NextResponse.json(
        { error: "Email is not scheduled" },
        { status: 400 },
      );
    }

    // Check if we have a trigger.dev scheduled ID
    if (!emailData.trigger_dev_schduled_id) {
      return NextResponse.json(
        { error: "No scheduled job ID found for this email" },
        { status: 400 },
      );
    }

    // Cancel the scheduled job in trigger.dev
    try {
      await runs.cancel(emailData.trigger_dev_schduled_id);
    } catch (cancelError) {
      console.error("Error canceling trigger.dev job:", cancelError);
      // Continue even if cancellation fails, as we still want to update the email status
    }

    // Update email status to failed (since "canceled" is not a valid status)
    await supabase
      .from("emails")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
        trigger_dev_schduled_id: null, // Clear the scheduled ID
      })
      .eq("id", body.emailId);

    return NextResponse.json({
      message: "Scheduled email canceled successfully",
    });
  } catch (error) {
    console.error("Cancel scheduled email error:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel scheduled email",
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
