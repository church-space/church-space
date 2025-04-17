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

    console.log("emailId", emailId);
    console.log("peopleEmailId", peopleEmailId);

    if (!emailId || !peopleEmailId) {
      console.log("Invalid token payload");
      return new Response("Invalid token payload", { status: 400 });
    }

    const supabase = await createClient();

    // Call the unsubscribe_from_all_emails function
    await supabase.rpc("unsubscribe_from_all_emails", {
      p_email_id: emailId,
      p_person_email_id: peopleEmailId,
    });

    return new Response(null, { status: 202 });
  } catch (error) {
    console.error("Error processing unsubscribe request:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
