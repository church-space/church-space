import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@church-space/supabase/server";
import {
  upsertCustomer,
  upsertSubscription,
  upsertPayment,
} from "@church-space/supabase/mutations/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  console.log("Stripe webhook received", request.body);
  return NextResponse.json({ message: "Stripe webhook received" });
}
