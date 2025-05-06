"use server";

import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function handleResubscribeAll(
  emailId: number | null,
  peopleEmailId: number,
  personAutomationId: number | null,
) {
  const ip = (await headers()).get("x-forwarded-for");

  const { success } = await ratelimit.limit(`${ip}-resubscribe-all`);

  if (!success) {
    throw new Error("Too many requests");
  }
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("re_subscribe_and_cleanup", {
    person_email_id_input: peopleEmailId,
    email_id_input: emailId ?? undefined,
    automation_step_id_input: personAutomationId ?? undefined,
  });

  if (error) {
    throw error;
  }

  return data;
}
