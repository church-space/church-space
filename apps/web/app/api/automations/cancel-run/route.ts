import "server-only";

import { cancelAutomationRunsTask } from "@/jobs/cancel-automation-runs";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { getEmailAutomationId } from "@church-space/supabase/queries/all/get-email-automation";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for");
    const { success } = await ratelimit.limit(`${ip}-cancel-automation-run`);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();

    // Validate request format
    if (
      !body.automationId ||
      typeof body.automationId !== "number" ||
      !body.reason ||
      typeof body.reason !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid automationId or reason" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: automationData, error: automationError } =
      await getEmailAutomationId(supabase, body.automationId);

    if (automationError) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 },
      );
    }

    if (!automationData) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 },
      );
    }

    // Trigger the cancel automation runs job
    const result = await cancelAutomationRunsTask.trigger({
      automationId: body.automationId,
      reason: body.reason,
    });

    return NextResponse.json({
      message: "Cancel automation runs job triggered successfully",
      result,
    });
  } catch (error) {
    console.error("Cancel automation run error:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger cancel automation runs job",
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
