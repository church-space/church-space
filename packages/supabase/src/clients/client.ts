import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/db";
import type { Client } from "../types";

export function createClient(): Client {
  return createBrowserClient<Database, "public", Database["public"]>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as Client;
}
