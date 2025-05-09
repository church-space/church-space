import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "@church-space/supabase/server";
import { getUserWithDetailsQuery } from "@church-space/supabase/get-user-with-details";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PCO Already Connected",
};

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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/70 to-background/60 dark:from-secondary/30">
      {children}
    </div>
  );
}
