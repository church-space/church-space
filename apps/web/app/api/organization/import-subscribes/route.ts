import "server-only";

import { importSubscibes } from "@/jobs/import-subscribes";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { getUserQuery } from "@church-space/supabase/get-user";
import { z } from "zod";

const ImportSubscribesAPIPayload = z.object({
  organizationId: z.string().uuid(),
  fileUrl: z.string().url(),
  emailColumn: z.string(),
  firstNameColumn: z.string(),
  lastNameColumn: z.string(),
  tagsColumn: z.string().nullable(),
});

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(6, "60s"), // Allow 10 requests per minute per IP
  redis: RedisClient,
});

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${ip}-import-subscribes`,
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
    const validationResult = ImportSubscribesAPIPayload.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const {
      organizationId,
      fileUrl,
      emailColumn,
      firstNameColumn,
      lastNameColumn,
      tagsColumn,
    } = validationResult.data;

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

    // Refresh PCO token before starting the job
    try {
      const pcoRefreshUrl = new URL("/api/pco/refresh", request.url);
      const requestHeaders = await headers(); // Await headers()
      const cookieHeader = requestHeaders.get("cookie"); // Get cookies from the original request
      const pcoRefreshFetchOptions: RequestInit = {
        method: "POST",
        headers: {},
      };

      if (cookieHeader) {
        // Ensure headers is a plain object for modification
        (pcoRefreshFetchOptions.headers as Record<string, string>)["Cookie"] =
          cookieHeader;
      }

      const pcoRefreshResponse = await fetch(
        pcoRefreshUrl.href,
        pcoRefreshFetchOptions,
      );

      // Attempt to parse JSON, provide a fallback if parsing fails or response is not JSON
      let pcoRefreshResponseData;
      try {
        pcoRefreshResponseData = await pcoRefreshResponse.json();
      } catch (e) {
        // If JSON parsing fails, construct an error object based on status text
        pcoRefreshResponseData = {
          error: `Failed to parse PCO refresh response (status: ${pcoRefreshResponse.status})`,
          details:
            pcoRefreshResponse.statusText || "Unknown error during PCO refresh",
          requiresReconnect:
            pcoRefreshResponse.status === 400 ||
            pcoRefreshResponse.status === 401, // Guess based on common statuses
        };
      }

      if (!pcoRefreshResponse.ok) {
        console.error("PCO token refresh failed:", {
          status: pcoRefreshResponse.status,
          errorBody: pcoRefreshResponseData,
        });

        return NextResponse.json(
          {
            error: "PCO token refresh failed before starting job.",
            details:
              pcoRefreshResponseData.error || "Unknown PCO refresh error",
            // Ensure requiresPcoReconnect is explicitly boolean
            requiresPcoReconnect:
              pcoRefreshResponseData.requiresReconnect === true,
          },
          { status: pcoRefreshResponse.status },
        );
      }

      // Log success message from refresh (e.g., "Token refreshed successfully." or "Token recently refreshed, skipping.")
      console.log(
        "PCO token pre-job refresh status:",
        pcoRefreshResponseData.message ||
          "Refresh successful, no specific message.",
      );
    } catch (refreshError) {
      console.error(
        "Exception during PCO token refresh API call:",
        refreshError,
      );
      return NextResponse.json(
        {
          error:
            "An unexpected error occurred while trying to refresh PCO token.",
          details:
            refreshError instanceof Error
              ? refreshError.message
              : "Unknown exception",
        },
        { status: 500 },
      );
    }
    // PCO token refresh successful or appropriately handled (e.g., recently skipped), proceed with the job

    // Trigger the import job
    const result = await importSubscibes.trigger({
      organizationId,
      fileUrl,
      emailColumn,
      firstNameColumn,
      lastNameColumn,
      tagsColumn,
      // Potentially add requested_by: user.user.id if needed in the job
    });

    return NextResponse.json({
      message: "Import subscribes job has been queued",
      result,
    });
  } catch (error) {
    console.error("Import subscribes error:", error);
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
