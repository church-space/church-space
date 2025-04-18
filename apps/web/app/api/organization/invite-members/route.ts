import { inviteMembers } from "@/jobs/invite-members";
import { NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { client as RedisClient } from "@church-space/kv";
import { getUserQuery } from "@church-space/supabase/get-user";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(5, "10s"),
  redis: RedisClient,
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = (await headers()).get("x-forwarded-for");

    const { success } = await ratelimit.limit(`${ip}-invite-members`);

    if (!success) {
      throw new Error("Too many requests");
    }

    const body = await request.json();

    // Validate request format
    if (!body.organization_id || typeof body.organization_id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid organization_id" },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(body.members) ||
      body.members.length === 0 ||
      body.members.length > 10
    ) {
      return NextResponse.json(
        { error: "Members must be an array with 1-10 items" },
        { status: 400 },
      );
    }

    // Validate each member has required fields
    for (const member of body.members) {
      if (
        !member.email ||
        !member.role ||
        typeof member.email !== "string" ||
        typeof member.role !== "string"
      ) {
        return NextResponse.json(
          { error: "Each member must have an email and role" },
          { status: 400 },
        );
      }
    }

    // Verify user exists and get their details
    const supabase = await createClient();
    const { data: user, error: userError } = await getUserQuery(supabase);

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Trigger the invite members job
    const result = await inviteMembers.trigger({
      organization_id: body.organization_id,
      invited_by: user.user.id,
      members: body.members,
    });

    return NextResponse.json({
      message: "Member invitations have been queued",
      result,
    });
  } catch (error) {
    console.error("Invite members error:", error);
    return NextResponse.json(
      {
        error: "Failed to send member invitations",
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
