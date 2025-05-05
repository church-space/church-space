import React from "react";
import Hero from "@/components/marketing/hero";
import LinksSection from "@/components/marketing/sections/links";
import PcoSection from "@/components/marketing/sections/pco";

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-12">
        <PcoSection />
        <LinksSection />
      </div>
    </div>
  );
}
