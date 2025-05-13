import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { z } from "zod";
import { deleteOrganization } from "@/jobs/delete-organization";
import { getUserQuery } from "@church-space/supabase/get-user";

const DeleteOrganizationAPIPayload = z.object({
  organizationId: z.string().uuid(),
  deleteOrganizationToken: z.string(),
});

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "60s"), // Allow 10 requests per minute per IP
  redis: RedisClient,
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${ip}-delete-organization`,
    );

    if (!success) {
      console.warn("Rate limit exceeded for IP:", ip);
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
    const validationResult = DeleteOrganizationAPIPayload.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { organizationId, deleteOrganizationToken } = validationResult.data;

    // Validate delete organization token
    if (!process.env.DELETE_ORGANIZATION_SECRET) {
      console.error(
        "DELETE_ORGANIZATION_SECRET environment variable is not set",
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (deleteOrganizationToken !== process.env.DELETE_ORGANIZATION_SECRET) {
      console.warn("Invalid delete organization token provided");
      return NextResponse.json(
        { error: "Invalid delete organization token" },
        { status: 403 },
      );
    }

    // Verify user exists and is authenticated
    const supabase = await createClient();

    const userDetails = await getUserQuery(supabase);

    if (!userDetails || !userDetails.data.user) {
      console.warn("User not authenticated");
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
      console.warn("User is not the owner of the organization");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Trigger the import job
    const result = await deleteOrganization.trigger({
      organization_id: organizationId,
    });

    return NextResponse.json({
      message: "Delete organization job has been queued",
      result,
    });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json(
      {
        error: "Failed to queue delete organization job",
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
