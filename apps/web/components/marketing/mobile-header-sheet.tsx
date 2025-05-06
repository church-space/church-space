"use client";

import { Button } from "@church-space/ui/button";
import {
  CircleInfo,
  CreditCard,
  Email,
  LifeRing,
  LinkIcon,
  Map,
  Megaphone,
  PcoLogo,
  Qrcode,
  Waypoints,
} from "@church-space/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MarketingLogoutButton } from "../sidebar/logout";

export default function MobileHeaderSheet({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        animationsOn={false}
        className="relative mt-2.5 h-[calc(100vh-4rem)] w-screen overflow-y-auto rounded-none border-none bg-background/80 p-4 backdrop-blur-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
      >
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">Features</span>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/#emails"
            onClick={() => setOpen(false)}
          >
            <Email />
            Email
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/#links"
            onClick={() => setOpen(false)}
          >
            <Qrcode />
            QR Codes
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/#links"
            onClick={() => setOpen(false)}
          >
            <LinkIcon />
            Link Pages
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/#automations"
            onClick={() => setOpen(false)}
          >
            <Waypoints />
            Automations
          </Link>
        </div>
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">Integrations</span>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/#pco"
            onClick={() => setOpen(false)}
          >
            <PcoLogo />
            Planning Center
          </Link>
        </div>
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">More</span>

          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/pricing"
            onClick={() => setOpen(false)}
          >
            <CreditCard />
            Pricing
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="https://help.churchspace.co"
            onClick={() => setOpen(false)}
            target="_blank"
          >
            <LifeRing />
            Support
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="https://help.churchspace.co/getting-started"
            onClick={() => setOpen(false)}
            target="_blank"
          >
            <Map />
            Getting Started
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/about"
            onClick={() => setOpen(false)}
          >
            <CircleInfo />
            About
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A"
            onClick={() => setOpen(false)}
          >
            <Megaphone />
            Contact
          </Link>
        </div>
        {isLoggedIn && (
          <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
            <MarketingLogoutButton showIcon={true} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
