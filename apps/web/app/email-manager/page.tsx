import "server-only";

import React from "react";
import Manage from "./manage-page";
import Unsubscribe from "./unsubscribe-page";
import { jwtVerify } from "jose";
import { headers } from "next/headers";
import { createClient } from "@church-space/supabase/server";
import { handleUnsubscribe } from "./use-unsubscribe";
import { handleCategoryUnsubscribe } from "./use-unsub-from-category";
import { handleCategoryResubscribe } from "./use-resubscribe-to-category";
import { handleResubscribeAll } from "./use-resubscribe-all";

type SearchParams = Promise<{
  type?: string;
  tk?: string;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = params.type;
  const tk = params.tk;

  const supabase = await createClient();

  // Get the request method from headers
  const headersList = await headers();
  const method = headersList.get("x-method") || "GET";

  let emailId: number | null = null;
  let peopleEmailId: number | null = null;

  if (tk) {
    try {
      const { payload } = await jwtVerify(
        tk,
        new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
      );

      // Extract the email_id and people_email_id from the payload
      emailId = payload.email_id as number;
      peopleEmailId = payload.people_email_id as number;

      console.log("Decoded Token Information:");
      console.log("Email ID:", emailId);
      console.log("People Email ID:", peopleEmailId);
      console.log("Full payload:", payload);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  // Handle POST request for one-click unsubscribe
  if (method === "POST" && type === "unsubscribe" && emailId && peopleEmailId) {
    // Call the unsubscribe_from_all_emails function
    await supabase.rpc("unsubscribe_from_all_emails", {
      p_email_id: emailId,
      p_person_email_id: peopleEmailId,
    });

    return new Response(null, { status: 202 });
  }

  if (!emailId || !peopleEmailId) {
    return <div>Invalid token</div>;
  }

  return (
    <>
      {type === "unsubscribe" && emailId && peopleEmailId && (
        <Unsubscribe
          emailId={emailId}
          peopleEmailId={peopleEmailId}
          unsubscribe={handleUnsubscribe}
          resubscribeAll={handleResubscribeAll}
        />
      )}
      {type === "manage" && emailId && peopleEmailId && (
        <Manage
          emailId={emailId}
          peopleEmailId={peopleEmailId}
          unsubscribeAll={handleUnsubscribe}
          unsubscribeFromCategory={handleCategoryUnsubscribe}
          resubscribeToCategory={handleCategoryResubscribe}
          resubscribeAll={handleResubscribeAll}
        />
      )}
    </>
  );
}
