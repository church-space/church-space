import React from "react";
import Manage from "./manage-page";
import Unsubscribe from "./unsubscribe-page";
import { jwtVerify } from "jose";

type SearchParams = Promise<{
  type?: string;
  tk?: string;
}>;

type Props = {
  searchParams: SearchParams;
  method?: string;
};

export default async function Page({ searchParams, method }: Props) {
  const params = await searchParams;
  const type = params.type;
  const tk = params.tk;

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
  if (method === "POST" && type === "unsubscribe") {
    console.log("email unsubscribed");
    return new Response(null, { status: 202 });
  }

  if (!emailId || !peopleEmailId) {
    return <div>Invalid token</div>;
  }

  return (
    <>
      {type === "unsubscribe" && emailId && peopleEmailId && (
        <Unsubscribe emailId={emailId} peopleEmailId={peopleEmailId} />
      )}
      {type === "manage" && emailId && peopleEmailId && (
        <Manage emailId={emailId} peopleEmailId={peopleEmailId} />
      )}
    </>
  );
}
