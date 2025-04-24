import React from "react";
import Footer from "@/components/marketing/footer";
import CallToAction from "@/components/marketing/cta";
import Header from "@/components/marketing/header";
import { createClient } from "@church-space/supabase/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: session } = await supabase.auth.getSession();

  const isLoggedIn = session?.session !== null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header isLoggedIn={isLoggedIn} />
      {children}
      <CallToAction />
      <Footer />
    </div>
  );
}
