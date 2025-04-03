import { scheduleEmail } from "@/jobs/schduled-emails";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { getUserOrganizationId } from "@church-space/supabase/get-user-with-details";

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
    const supabase = await createClient();

    const organizationId = await getUserOrganizationId(supabase);

    // Verify email exists and is in a valid state
    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .select("status, scheduled_for, organization_id")
      .eq("id", body.emailId)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (emailData.organization_id !== organizationId[0]) {
      return NextResponse.json(
        { error: "Email does not belong to organization" },
        { status: 400 },
      );
    }

    // Check if email has a scheduled_for date
    if (!emailData.scheduled_for) {
      return NextResponse.json(
        { error: "Email does not have a scheduled date" },
        { status: 400 },
      );
    }

    // Check email status
    if (
      emailData.status === "sent" ||
      emailData.status === "sending" ||
      emailData.status === "scheduled" ||
      emailData.status === "failed" ||
      emailData.status === null
    ) {
      return NextResponse.json(
        { error: `Email cannot be scheduled with status: ${emailData.status}` },
        { status: 400 },
      );
    }

    // Check scheduled time
    const scheduledDate = new Date(emailData.scheduled_for);
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (scheduledDate < now) {
      return NextResponse.json(
        { error: "Email cannot be scheduled for a date in the past" },
        { status: 400 },
      );
    }

    if (scheduledDate > oneYearFromNow) {
      return NextResponse.json(
        { error: "Email cannot be scheduled more than a year in the future" },
        { status: 400 },
      );
    }

    // Update email status to scheduled if it's not already

    await supabase
      .from("emails")
      .update({
        status: "scheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.emailId);

    // Trigger the email scheduling job
    const result = await scheduleEmail.trigger({
      emailId: body.emailId,
    });

    return NextResponse.json({
      message: "Email scheduling job started successfully",
      result,
    });
  } catch (error) {
    console.error("Schedule email error:", error);
    return NextResponse.json(
      {
        error: "Failed to start email scheduling job",
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
