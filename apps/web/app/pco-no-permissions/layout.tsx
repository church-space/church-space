import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "@trivo/supabase/server";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  return <>{children}</>;
}
