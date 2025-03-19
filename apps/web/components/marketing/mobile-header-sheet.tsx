import React, { useState } from "react";
import { Button } from "@church-space/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
export default function MobileHeaderSheet() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        animationsOn={false}
        className="mt-2.5 h-[calc(100vh-4rem)] w-screen overflow-y-auto rounded-none bg-background/80 p-4 backdrop-blur-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
      >
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">Features</span>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/features/email"
          >
            Email
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/features/qr"
          >
            QR Codes
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/features/links"
          >
            Link Lists
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/integrations"
          >
            Planning Center
          </Link>
        </div>
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">More</span>

          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/support"
          >
            Support
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/getting-started"
          >
            Getting Started
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="/about"
          >
            About
          </Link>
          <Link
            className="transition-colors hover:text-muted-foreground"
            href="mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A"
          >
            Contact
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
