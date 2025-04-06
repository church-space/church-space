import React from "react";
import Footer from "@/components/marketing/footer";
import SupportCTA from "@/components/support/support-cta";
import SupportHeader from "@/components/support/support-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SupportHeader />
      {children}
      <SupportCTA />
      <Footer />
    </div>
  );
}
