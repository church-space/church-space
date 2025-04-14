import React from "react";
import Hero from "@/components/marketing/hero";
import LinksSection from "@/components/marketing/sections/links";
import PcoAndAutomationsSection from "@/components/marketing/sections/pco-automations";
import EmailsSection from "@/components/marketing/sections/emails";

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <div className="mx-auto w-full max-w-7xl space-y-16 py-12">
        <EmailsSection />
        <PcoAndAutomationsSection />
        <LinksSection />
      </div>
    </div>
  );
}
