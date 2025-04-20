"use server";

import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function handleCategoryUnsubscribe(
  emailId: number,
  peopleEmailId: number,
  emailCategoryId: number,
) {
  const ip = (await headers()).get("x-forwarded-for");

  const { success } = await ratelimit.limit(`${ip}-unsubscribe-category`);

  if (!success) {
    throw new Error("Too many requests");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("unsubscribe_from_email_category", {
    unsub_email_id: emailId,
    person_email_id: peopleEmailId,
    category_id: emailCategoryId,
  });

  if (error) {
    console.error("Error unsubscribing from category:", error);
    throw error;
  }
}
