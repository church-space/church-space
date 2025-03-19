import React from "react";
import Footer from "@/components/marketing/footer";
import CallToAction from "@/components/marketing/cta";
import Header from "@/components/marketing/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      {children}
      <CallToAction />
      <Footer />
    </div>
  );
}
