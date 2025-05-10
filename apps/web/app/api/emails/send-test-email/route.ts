import "server-only";

import { sendEmails } from "@/jobs/test-email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "60s"),
  redis: RedisClient,
});

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  emails: z.array(
    z.object({
      from: z.string().email(),
      to: z.array(z.string().email()).min(1).max(5),
      subject: z.string(),
      text: z.string(),
      html: z.string().optional(),
      react: z.string().optional(),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
      reply_to: z.array(z.string().email()).optional(),
      headers: z.record(z.string()).optional(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for");
    const { success } = await ratelimit.limit(`${ip}-test-email`);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const result = await sendEmails.trigger(validatedData);
    return NextResponse.json({ message: "Emails queued successfully", result });
  } catch (error) {
    console.error("Send email error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 },
      );
    }
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
