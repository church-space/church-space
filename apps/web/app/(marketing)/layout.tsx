import React from "react";
import Footer from "@/components/marketing/footer";
import CallToAction from "@/components/marketing/cta";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      <CallToAction />
      <Footer />
    </div>
  );
}
