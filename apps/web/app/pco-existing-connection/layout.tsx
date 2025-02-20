import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "@trivo/supabase/server";
import { getUserWithDetailsQuery } from "@trivo/supabase/get-user-with-details";

export default async function Layout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: { connectedByFirstName: string; connectedByLastName: string };
}) {
  if (!searchParams.connectedByFirstName || !searchParams.connectedByLastName) {
    return redirect("/");
  }
  const supabase = await createClient();
  const user = await getUserWithDetailsQuery(supabase);

  if (!user) {
    return redirect("/login");
  }

  return <>{children}</>;
}
