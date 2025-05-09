"use client";

import React, { useState } from "react";
import { Button } from "@church-space/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@church-space/ui/cn";
import {
  Users,
  Refresh,
  LinkIcon,
  Qrcode,
  Robot,
} from "@church-space/ui/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@church-space/ui/dropdown-menu";
import cookies from "js-cookie";
import { NumberTicker } from "@church-space/ui/number-ticker";
import FAQSection from "@/components/marketing/sections/faq";

type EmailTier = {
  volume: number;
  price: number;
};

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<EmailTier>({
    volume: 5000,
    price: 9,
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSignup = (plan: string | number) => {
    cookies.set("selected_plan", plan.toString(), { expires: 7 }); // Cookie expires in 7 days
    window.location.href = `/signup?plan=${plan}`;
  };

  const emailTiers: EmailTier[] = [
    { volume: 5000, price: 9 },
    { volume: 10000, price: 18 },
    { volume: 20000, price: 36 },
    { volume: 30000, price: 54 },
    { volume: 40000, price: 72 },
    { volume: 50000, price: 90 },
    { volume: 60000, price: 108 },
    { volume: 70000, price: 126 },
    { volume: 80000, price: 144 },
    { volume: 100000, price: 180 },
  ];

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="mx-auto mb-24 mt-16 w-full max-w-5xl px-2">
      <div className="space-y-6">
        <div className="group flex flex-col gap-6">
          <div className="text-center text-5xl font-bold">Pricing</div>
          <div className="flex flex-col gap-4 pb-4">
            <p className="mx-auto w-full max-w-lg text-balance text-center leading-tight text-muted-foreground">
              Pick the plan that works best for your church, or start for free.
              You can always change your plan later.
            </p>
            <p className="mx-auto w-full max-w-lg text-balance text-center font-medium leading-tight text-muted-foreground transition-colors group-hover:text-primary">
              A Planning Center account is required to use Church Space.
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 rounded-xl p-3 md:grid-cols-2">
          <div className="my-4 w-full space-y-6 rounded-lg border bg-secondary/20 p-6 py-10 shadow-sm dark:bg-secondary/10 md:rounded-r-none md:border-r-0 md:py-6">
            <div className="ml-2 space-y-2">
              <h2 className="text-3xl font-bold">Free</h2>

              <div className="flex items-baseline gap-1">
                <h3 className="text-xl font-bold">$0</h3>
              </div>
            </div>
            <div className="flex w-full items-center gap-0.5 rounded-lg border px-4 py-3">
              <p className="text-base font-semibold sm:text-lg">
                500 email sends per month
              </p>
              <div className="mb-1 text-sm text-muted-foreground">*</div>
            </div>
            <div className="space-y-3 px-3 pb-3 pt-4 md:pb-9">
              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Users height={"22"} width={"22"} />
                </div>
                <span>Unlimited contacts</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Refresh height={"22"} width={"22"} />
                </div>
                <span>Sync with Planning Center</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Robot height={"22"} width={"22"} />
                </div>
                <span>Unlimited automations</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <LinkIcon height={"22"} width={"22"} />
                </div>
                <span>Unlimited link pages</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Qrcode height={"22"} width={"22"} />
                </div>
                <span>Unlimited QR codes</span>
              </div>
            </div>
            <div
              onClick={() => handleSignup("free")}
              className="cursor-pointer"
            >
              <Button variant="secondary" className="h-12 w-full">
                Get Started
              </Button>
            </div>
          </div>
          <div className="w-full space-y-6 rounded-lg border border-primary bg-secondary/50 p-6 py-10 shadow-sm dark:bg-secondary/20">
            <div className="ml-2 space-y-2">
              <h2 className="text-3xl font-bold">Pro</h2>

              <div className="flex items-baseline gap-1">
                <h3 className="text-xl font-bold">
                  $<NumberTicker value={selectedTier.price} startValue={8} />
                </h3>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex w-full cursor-pointer select-none items-center justify-between rounded-lg border bg-background px-4 py-3 text-lg"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div className="flex items-center gap-1">
                    <p className="text-base font-medium sm:text-lg">
                      {formatNumber(selectedTier.volume)} email sends per month
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
                </DropdownMenuTrigger>

                <DropdownMenuContent className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-auto rounded-md border border-border p-2">
                  {emailTiers.map((tier) => (
                    <DropdownMenuItem
                      key={tier.volume}
                      className={cn(
                        "flex w-full cursor-pointer p-3.5 hover:bg-secondary/40",
                        selectedTier.volume === tier.volume
                          ? "bg-secondary/40"
                          : "",
                      )}
                      onClick={() => {
                        setSelectedTier(tier);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span>{formatNumber(tier.volume)} Emails</span>
                        <span className="font-medium text-muted-foreground">
                          ${tier.price}/month
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-3 px-3 pb-3 pt-4 md:pb-9">
              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Users height={"22"} width={"22"} />
                </div>
                <span>Unlimited contacts</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Refresh height={"22"} width={"22"} />
                </div>
                <span>Sync with Planning Center</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Robot height={"22"} width={"22"} />
                </div>
                <span>Unlimited automations</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <LinkIcon height={"22"} width={"22"} />
                </div>
                <span>Unlimited link pages</span>
              </div>

              <div className="flex items-center">
                <div className="mr-2.5 text-[#6065FE]">
                  <Qrcode height={"22"} width={"22"} />
                </div>
                <span>Unlimited active QR codes</span>
              </div>
            </div>
            <div
              onClick={() => handleSignup(selectedTier.volume)}
              className="cursor-pointer"
            >
              <Button className="h-12 w-full">Get Started</Button>
            </div>
          </div>
        </div>
        <p className="p-3 text-sm text-muted-foreground">
          * For example, if you send one email to 1,000 people, that counts as
          1,000 emails sent.
        </p>
      </div>
      <FAQSection className="pt-20" />
    </div>
  );
}
