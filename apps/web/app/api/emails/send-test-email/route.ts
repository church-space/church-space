import { sendEmails } from "@/jobs/test-email-queue";
import { NextResponse } from "next/server";
import { z } from "zod";

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
