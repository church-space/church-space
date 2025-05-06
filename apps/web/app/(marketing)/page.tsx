import React from "react";
import Hero from "@/components/marketing/hero";
import LinksSection from "@/components/marketing/sections/links";
import PcoSection from "@/components/marketing/sections/pco";
import FAQSection from "@/components/marketing/sections/faq";

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <div className="mx-auto w-full pb-12 pt-0 md:pt-12">
        <PcoSection />
        <div className="w-full bg-gradient-to-br from-primary to-primary/80 px-4 py-8 dark:to-primary/50">
          <div className="mx-auto w-full max-w-7xl rounded-lg border bg-card p-4">
            <h1 className="text-2xl font-semibold">Emails</h1>
          </div>
        </div>
        <LinksSection />
        <FAQSection className="px-4 py-20 pt-36" />
      </div>
    </div>
  );
}
