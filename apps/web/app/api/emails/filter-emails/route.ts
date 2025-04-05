import { filterEmailRecipients } from "@/jobs/filter-emails";
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

    // Verify email exists and is in a valid state
    const supabase = await createClient();

    const organizationId = await getUserOrganizationId(supabase);

    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .select("status, scheduled_for, list_id, organization_id")
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

    // Check email status
    if (emailData.status === "sent") {
      return NextResponse.json(
        { error: "Email has already been sent" },
        { status: 400 },
      );
    }

    if (emailData.status === "sending") {
      return NextResponse.json(
        { error: "Email is already being sent" },
        { status: 400 },
      );
    }

    // Trigger the email filtering job
    const result = await filterEmailRecipients.trigger({
      emailId: body.emailId,
    });

    return NextResponse.json({
      message: "Email filtering job started successfully",
      result,
    });
  } catch (error) {
    console.error("Filter email error:", error);
    return NextResponse.json(
      {
        error: "Failed to start email filtering job",
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
