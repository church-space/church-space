import "server-only";

import React from "react";
import Manage from "./manage-page";
import Unsubscribe from "./unsubscribe-page";
import { jwtVerify } from "jose";
import { handleUnsubscribe } from "./use-unsubscribe";
import { handleCategoryUnsubscribe } from "./use-unsub-from-category";
import { handleCategoryResubscribe } from "./use-resubscribe-to-category";
import { handleResubscribeAll } from "./use-resubscribe-all";
import { getCategories } from "./use-categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Email Preferences",
};

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

  let emailId: number | null = null;
  let peopleEmailId: number | null = null;
  let automationStepId: number | null = null;

  if (tk) {
    try {
      const { payload } = await jwtVerify(
        tk,
        new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET),
      );

      // Extract the email_id and people_email_id from the payload
      emailId = payload.email_id as number | null;
      peopleEmailId = payload.people_email_id as number;
      automationStepId = payload.automation_step_id as number | null;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  if (!peopleEmailId) {
    return <div>Invalid token</div>;
  }

  if (!automationStepId && !emailId) {
    return <div>Invalid token</div>;
  }

  const handleServerUnsubscribe = async () => {
    "use server";
    if (peopleEmailId && (emailId || automationStepId)) {
      await handleUnsubscribe(emailId, peopleEmailId, automationStepId);
    }
  };

  const handleServerResubscribeAll = async () => {
    "use server";
    if (peopleEmailId && (emailId || automationStepId)) {
      await handleResubscribeAll(emailId, peopleEmailId, automationStepId);
    }
  };

  const handleServerCategoryUnsubscribe = async (categoryId: number) => {
    "use server";
    if (peopleEmailId && (emailId || automationStepId)) {
      await handleCategoryUnsubscribe(
        emailId,
        peopleEmailId,
        categoryId,
        automationStepId,
      );
    }
  };

  const handleServerCategoryResubscribe = async (categoryId: number) => {
    "use server";
    if (peopleEmailId && (emailId || automationStepId)) {
      await handleCategoryResubscribe(
        peopleEmailId,
        categoryId,
        emailId,
        automationStepId,
      );
    }
  };

  let categories: Category[] = [];
  if (type === "manage") {
    categories = await getCategories(peopleEmailId);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/70 to-background/60 py-10 dark:from-secondary/30">
      {type === "unsubscribe" && peopleEmailId && (
        <Unsubscribe
          unsubscribe={handleServerUnsubscribe}
          resubscribeAll={handleServerResubscribeAll}
          token={tk ?? ""}
        />
      )}
      {type === "manage" && peopleEmailId && (
        <Manage
          categories={categories}
          unsubscribeAll={handleServerUnsubscribe}
          unsubscribeFromCategory={handleServerCategoryUnsubscribe}
          resubscribeToCategory={handleServerCategoryResubscribe}
          resubscribeAll={handleServerResubscribeAll}
        />
      )}
    </div>
  );
}
