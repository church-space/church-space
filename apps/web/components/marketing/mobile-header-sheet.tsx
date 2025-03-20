import React from "react";
import { Button } from "@church-space/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@church-space/ui/popover";
import {
  MailFilled,
  Qrcode,
  Waypoints,
  LinkIcon,
  CreditCard,
  LifeRing,
  Map,
  CircleInfo,
  Megaphone,
} from "@church-space/ui/icons";
import PCOlogo from "@/public/pco-logo.png";
import Image from "next/image";

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
        className="mt-2.5 h-[calc(100vh-4rem)] w-screen overflow-y-auto rounded-none border-none bg-background/80 p-4 backdrop-blur-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
      >
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">Features</span>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/features/email"
          >
            <MailFilled />
            Email
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/features/qr"
          >
            <Qrcode />
            QR Codes
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/features/links"
          >
            <LinkIcon />
            Link Lists
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/features/automations"
          >
            <Waypoints />
            Automations
          </Link>
        </div>
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">Integrations</span>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/integrations"
          >
            <Image
              src={PCOlogo}
              alt="PCO Logo"
              height={16}
              width={16}
              className="mr-1"
            />
            Planning Center
          </Link>
        </div>
        <div className="flex flex-col gap-3 p-4 text-lg font-semibold">
          <span className="text-sm text-muted-foreground">More</span>

          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/pricing"
          >
            <CreditCard />
            Pricing
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/support"
          >
            <LifeRing />
            Support
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/getting-started"
          >
            <Map />
            Getting Started
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="/about"
          >
            <CircleInfo />
            About
          </Link>
          <Link
            className="flex items-center gap-2 transition-colors hover:text-muted-foreground"
            href="mailto:hello@churchspace.co?subject=Question%20about%20Church%20Space&body=NAME%3A%20%0ACHURCH%3A%20%0A%0AQUESTION%3A%20%0A"
          >
            <Megaphone />
            Contact
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
