"use server";

import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function handleUnsubscribe(
  emailId: number | null,
  peopleEmailId: number,
  automationStepId: number | null,
) {
  const ip = (await headers()).get("x-forwarded-for");

  const { success } = await ratelimit.limit(`${ip}-unsubscribe`);

  if (!success) {
    throw new Error("Too many requests");
  }

  const supabase = await createClient();
  await supabase.rpc("unsubscribe_from_all_emails", {
    person_email_id_input: peopleEmailId,
    email_id_input: emailId ?? undefined,
    automation_step_id_input: automationStepId ?? undefined,
  });
}
