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
import { getCategories } from "./use-categories";

type Category = {
  category_id: number;
  pco_name: string;
  description: string;
  is_unsubscribed: boolean;
};

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

  const handleServerUnsubscribe = async () => {
    "use server";
    if (emailId && peopleEmailId) {
      await handleUnsubscribe(emailId, peopleEmailId);
    }
  };

  const handleServerResubscribeAll = async () => {
    "use server";
    if (emailId && peopleEmailId) {
      await handleResubscribeAll(emailId, peopleEmailId);
    }
  };

  const handleServerCategoryUnsubscribe = async (categoryId: number) => {
    "use server";
    if (emailId && peopleEmailId) {
      await handleCategoryUnsubscribe(emailId, peopleEmailId, categoryId);
    }
  };

  const handleServerCategoryResubscribe = async (categoryId: number) => {
    "use server";
    if (peopleEmailId) {
      await handleCategoryResubscribe(peopleEmailId, categoryId);
    }
  };

  let categories: Category[] = [];
  if (type === "manage") {
    categories = await getCategories(emailId, peopleEmailId);
  }

  return (
    <>
      {type === "unsubscribe" && emailId && peopleEmailId && (
        <Unsubscribe
          unsubscribe={handleServerUnsubscribe}
          resubscribeAll={handleServerResubscribeAll}
        />
      )}
      {type === "manage" && emailId && peopleEmailId && (
        <Manage
          categories={categories}
          unsubscribeAll={handleServerUnsubscribe}
          unsubscribeFromCategory={handleServerCategoryUnsubscribe}
          resubscribeToCategory={handleServerCategoryResubscribe}
          resubscribeAll={handleServerResubscribeAll}
        />
      )}
    </>
  );
}
