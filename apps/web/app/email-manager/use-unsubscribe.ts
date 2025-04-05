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
  emailId: number,
  peopleEmailId: number,
) {
  const ip = (await headers()).get("x-forwarded-for");

  const { success } = await ratelimit.limit(`${ip}-unsubscribe`);

  if (!success) {
    throw new Error("Too many requests");
  }

  const supabase = await createClient();
  await supabase.rpc("unsubscribe_from_all_emails", {
    p_email_id: emailId,
    p_person_email_id: peopleEmailId,
  });
  console.log("unsubscribed");
}
