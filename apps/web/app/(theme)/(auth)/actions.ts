"use server";

import { createClient } from "@church-space/supabase/server";
import { client as RedisClient } from "@church-space/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

// Create rate limiter with a fixed window of 5 attempts per 60 seconds
const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(6, "60s"),
  redis: RedisClient,
});

// Helper function to apply rate limiting
async function applyRateLimit(actionName: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const { success } = await ratelimit.limit(`${ip}-${actionName}`);

  if (!success) {
    throw new Error("Too many requests. Please try again later.");
  }
}

export async function signInWithOtp(email: string, redirectTo?: string | null) {
  await applyRateLimit("signInWithOtp");
  const supabase = await createClient();

  const redirectUrl = redirectTo
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${redirectTo}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

export async function verifyOtp(email: string, token: string) {
  await applyRateLimit("verifyOtp");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithGoogle(redirectTo?: string | null) {
  await applyRateLimit("signInWithGoogle");
  const supabase = await createClient();

  const redirectUrl = redirectTo
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${redirectTo}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data;
}

export async function verifyInviteToken(token: string) {
  try {
    const { jwtVerify } = await import("jose");

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.INVITE_MEMBERS_SECRET),
    );

    if (!payload.exp) {
      throw new Error("No expiration date found in invite token");
    }

    const inviteExpires = new Date(payload.exp * 1000);

    return {
      isValid: true,
      expires: inviteExpires,
    };
  } catch (error) {
    console.error("Error verifying invite token:", error);
    return {
      isValid: false,
      expires: null,
    };
  }
}
