"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@church-space/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@church-space/ui/cn";
import {
  Users,
  Refresh,
  LinkIcon,
  Qrcode,
  Robot,
  TemplatesIcon,
} from "@church-space/ui/icons";

type EmailTier = {
  volume: number;
  price: number;
};

export default function page() {
  const [selectedTier, setSelectedTier] = useState<EmailTier>({
    volume: 5000,
    price: 8,
  });
  const [isOpen, setIsOpen] = useState(false);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: "center" });
    }
  }, [isOpen]);

  const emailTiers: EmailTier[] = [
    { volume: 5000, price: 8 },
    { volume: 10000, price: 16 },
    { volume: 20000, price: 32 },
    { volume: 30000, price: 48 },
    { volume: 40000, price: 64 },
    { volume: 50000, price: 80 },
    { volume: 60000, price: 96 },
    { volume: 70000, price: 112 },
    { volume: 80000, price: 128 },
    { volume: 90000, price: 144 },
    { volume: 100000, price: 160 },
    { volume: 125000, price: 200 },
    { volume: 150000, price: 240 },
    { volume: 175000, price: 280 },
    { volume: 200000, price: 320 },
    { volume: 225000, price: 360 },
    { volume: 250000, price: 400 },
  ];

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="mx-auto mb-32 mt-12 w-full max-w-5xl px-5">
      <div className="rounded-lg bg-muted p-3">
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
          <div className="w-full space-y-6 p-6">
            <h2 className="text-3xl font-bold">Free</h2>
            <div className="flex w-full items-center gap-0.5 rounded-lg bg-background p-4">
              <p className="text-lg font-semibold">250 emails per month</p>
              <div className="mb-1 text-sm text-muted-foreground">*</div>
            </div>
            <div className="space-y-3 px-3 py-6">
              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Users height={"22"} width={"22"} />
                </div>
                <span>Unlimited Contacts</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Refresh height={"22"} width={"22"} />
                </div>
                <span>Sync with Planning Center</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <LinkIcon height={"22"} width={"22"} />
                </div>
                <span>Create up to 3 link lists</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Qrcode height={"22"} width={"22"} />
                </div>
                <span>Create up to 10 active QR codes</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Robot height={"22"} width={"22"} />
                </div>
                <span>Create up to 1 active automation</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <TemplatesIcon height={"22"} width={"22"} />
                </div>
                <span>Unlimited templates</span>
              </div>
            </div>
            <Button variant="outline" className="h-[3.1rem] w-full">
              Get Started
            </Button>
          </div>
          <div className="w-full space-y-6 rounded-lg bg-background p-6">
            <div className="ml-2 flex items-baseline gap-1">
              <h2 className="text-3xl font-bold">${selectedTier.price}</h2>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
            <div className="relative">
              <div
                className="flex cursor-pointer select-none items-center justify-between rounded-lg bg-muted p-4 text-lg"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="flex items-center gap-1">
                  <p className="text-lg font-medium">
                    {formatNumber(selectedTier.volume)} Emails per month
                  </p>
                  <div className="text-sm text-muted-foreground">*</div>
                </div>
                <ChevronDown
                  size={24}
                  className={cn(
                    "text-gray-700 transition-transform",
                    isOpen ? "rotate-180" : "",
                  )}
                />
              </div>

              {isOpen && (
                <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {emailTiers.map((tier) => (
                    <div
                      key={tier.volume}
                      ref={
                        selectedTier.volume === tier.volume
                          ? selectedItemRef
                          : null
                      }
                      className={cn(
                        "cursor-pointer p-4 hover:bg-gray-50",
                        selectedTier.volume === tier.volume
                          ? "bg-[#6065FE]/10"
                          : "",
                      )}
                      onClick={() => {
                        setSelectedTier(tier);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{formatNumber(tier.volume)} Emails</span>
                        <span className="font-medium">${tier.price}/month</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3 px-3 py-6">
              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Users height={"22"} width={"22"} />
                </div>
                <span>Unlimited Contacts</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Refresh height={"22"} width={"22"} />
                </div>
                <span>Sync with Planning Center</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <LinkIcon height={"22"} width={"22"} />
                </div>
                <span>Create up to 3 link lists</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Qrcode height={"22"} width={"22"} />
                </div>
                <span>Create up to 10 active QR codes</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Robot height={"22"} width={"22"} />
                </div>
                <span>Create up to 1 active automation</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <TemplatesIcon height={"22"} width={"22"} />
                </div>
                <span>Unlimited templates</span>
              </div>
            </div>
            <Button className="h-12 w-full">Get Started</Button>
          </div>
        </div>
        <p className="p-3 text-xs text-muted-foreground">
          * For example, if you send one email to 1,000 people, that counts as
          1,000 emails sent.
        </p>
      </div>
    </div>
  );
}
