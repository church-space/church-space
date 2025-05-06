import { jwtVerify } from "jose";
import { createClient } from "@church-space/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const tk = url.searchParams.get("tk");

  if (!tk || type !== "unsubscribe") {
    return new Response("Invalid request", { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(
      tk,
      new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
    );

    const emailId = payload.email_id as number;
    const peopleEmailId = payload.people_email_id as number;
    const automationStepId = payload.automation_step_id as number;

    if (!peopleEmailId) {
      return new Response("Invalid token payload", { status: 400 });
    }
    if (!emailId && !automationStepId) {
      return new Response("Invalid token payload", { status: 400 });
    }

    const supabase = await createClient();

    // Call the unsubscribe_from_all_emails function
    await supabase.rpc("unsubscribe_from_all_emails", {
      person_email_id_input: peopleEmailId,
      email_id_input: emailId || undefined,
      automation_step_id_input: automationStepId || undefined,
    });

    return new Response(null, { status: 202 });
  } catch (error) {
    console.error("Error processing unsubscribe request:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
