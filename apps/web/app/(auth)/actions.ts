"use server";

import { createClient } from "@trivo/supabase/server";

export async function signInWithOtp(email: string, redirectTo?: string | null) {
  const supabase = await createClient();

  const redirectUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${redirectTo}` ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

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
  const supabase = await createClient();

  const redirectUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${redirectTo}` ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

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
