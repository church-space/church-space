import React from "react";
import Footer from "@/components/marketing/footer";
import CallToAction from "@/components/marketing/cta";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <CallToAction />
      <Footer />
    </div>
  );
}
