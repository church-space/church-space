import "server-only";

import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { z } from "zod";
import { deleteUser } from "@/jobs/delete-user";

const DeleteUserAPIPayload = z.object({
  userId: z.string().uuid(),
  deleteUserToken: z.string(),
});

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "60s"), // Allow 10 requests per minute per IP
  redis: RedisClient,
});

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${ip}-delete-user`,
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
    const validationResult = DeleteUserAPIPayload.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { userId, deleteUserToken } = validationResult.data;

    // Validate delete user token
    if (!process.env.DELETE_USER_SECRET) {
      console.error("DELETE_USER_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (deleteUserToken !== process.env.DELETE_USER_SECRET) {
      return NextResponse.json(
        { error: "Invalid delete user token" },
        { status: 403 },
      );
    }

    // Trigger the import job
    const result = await deleteUser.trigger({
      user_id: userId,
    });

    return NextResponse.json({
      message: "Delete user job has been queued",
      result,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        error: "Failed to queue delete user job",
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
