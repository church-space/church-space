import "server-only";

import { filterEmailRecipients } from "@/jobs/filter-emails";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { getUserAndOrganizationId } from "@church-space/supabase/get-user-with-details";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(5, "10s"),
  redis: RedisClient,
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for");

    const { success } = await ratelimit.limit(`${ip}-filter-emails`);

    if (!success) {
      throw new Error("Too many requests");
    }

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

    const { user, organizationId } = await getUserAndOrganizationId(supabase);

    if (!organizationId) {
      return NextResponse.json(
        { error: "User does not belong to an organization" },
        { status: 400 },
      );
    }

    const { data: emailData, error: emailError } = await supabase
      .from("emails")
      .select("status, scheduled_for, list_id, organization_id")
      .eq("id", body.emailId)
      .eq("organization_id", organizationId)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (emailData.organization_id !== organizationId) {
      return NextResponse.json(
        { error: "Email does not belong to organization" },
        { status: 400 },
      );
    }

    // update sent by to user id
    const { error: updateError } = await supabase
      .from("emails")
      .update({ sent_by: user.id })
      .eq("id", body.emailId)
      .eq("organization_id", organizationId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update email sent by" },
        { status: 500 },
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
