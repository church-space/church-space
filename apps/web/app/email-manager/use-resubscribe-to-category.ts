"use server";

import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function handleCategoryResubscribe(
  peopleEmailId: number,
  categoryId: number,
) {
  const ip = (await headers()).get("x-forwarded-for");

  const { success } = await ratelimit.limit(`${ip}-resubscribe-category`);

  if (!success) {
    throw new Error("Too many requests");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("resubscribe_category", {
    p_people_email_id: peopleEmailId,
    p_category_id: categoryId,
  });

  if (error) {
    throw error;
  }

  return data;
}
