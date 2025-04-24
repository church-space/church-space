import "server-only";

import { importUnsubscribes } from "@/jobs/import-unsubscribes";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { getUserQuery } from "@church-space/supabase/get-user";
import { z } from "zod";

// Re-use or define the payload schema for validation
const EmailStatusEnum = z.enum([
  "unsubscribed",
  "pco_blocked",
  "subscribed",
  "cleaned",
]);

const ImportUnsubscribesAPIPayload = z.object({
  organizationId: z.string().uuid(),
  fileUrl: z.string().url(),
  emailColumn: z.string(),
  status: EmailStatusEnum,
});

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "60s"), // Allow 10 requests per minute per IP
  redis: RedisClient,
});

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${ip}-import-unsubscribes`,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = ImportUnsubscribesAPIPayload.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { organizationId, fileUrl, emailColumn, status } =
      validationResult.data;

    // Verify user exists and is authenticated
    const supabase = await createClient();
    const { data: user, error: userError } = await getUserQuery(supabase);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorization check: Verify user is an owner of the organizationId
    const { data: isOwner, error: rpcError } = await supabase.rpc(
      "is_org_owner",
      { org: organizationId },
    );

    if (rpcError) {
      console.error("RPC is_org_owner error:", rpcError);
      return NextResponse.json(
        { error: "Failed to verify organization ownership" },
        { status: 500 },
      );
    }

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Trigger the import job
    const result = await importUnsubscribes.trigger({
      organizationId,
      fileUrl,
      emailColumn,
      status,
      // Potentially add requested_by: user.user.id if needed in the job
    });

    return NextResponse.json({
      message: "Import unsubscribes job has been queued",
      result,
    });
  } catch (error) {
    console.error("Import unsubscribes error:", error);
    return NextResponse.json(
      {
        error: "Failed to queue import job",
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
