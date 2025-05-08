import React from "react";
import ImportPage from "./client-page";
import { createClient } from "@church-space/supabase/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import Link from "next/link";
import { Button } from "@church-space/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import People",
};

export default async function page() {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user?.organizationMembership) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-balance text-center">
        <div className="text-lg">
          You are not authorized to access this page. Please contact an owner of
          your organization to gain access.
        </div>
        <Link href="/people">
          <Button>Back to People</Button>
        </Link>
      </div>
    );
  }

  if (user?.organizationMembership.role !== "owner") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-balance text-center">
        <div className="text-lg">
          You are not authorized to access this page. Please contact an owner of
          your organization to gain access.
        </div>
        <Link href="/people">
          <Button>Back to People</Button>
        </Link>
      </div>
    );
  }
  return <ImportPage />;
}
