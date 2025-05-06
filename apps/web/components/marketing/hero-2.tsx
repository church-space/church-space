"use client";

import Link from "next/link";

import { Button } from "@church-space/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import HeroSubtitle from "./hero-subtitle";

export default function HeroSection() {
  return (
    <main className="-translate-y-16 pt-8 sm:pt-20">
      <div
        aria-hidden
        className="z-2 absolute inset-0 isolate hidden opacity-50 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <section className="overflow-hidden bg-white dark:bg-transparent">
        <div className="relative mx-auto px-6 pb-10 pt-28 lg:py-24">
          <div className="mx-auto flex flex-col items-center justify-center gap-3 px-6 md:max-w-[690px] lg:gap-6">
            <h1 className="text-balance text-center text-4xl font-bold sm:text-6xl lg:text-7xl">
              The better way to email your church
            </h1>
            <HeroSubtitle />
            <div className="flex flex-col items-center justify-center gap-2 pt-2 md:flex-row lg:gap-4">
              <Link href="/signup">
                <Button className="h-10 px-4 text-base sm:h-12 sm:px-6">
                  Start Sending
                </Button>
              </Link>
              <Link href="https://cal.com/thomasharmond/15min" target="_blank">
                <Button
                  variant="link"
                  className="h-10 gap-1 px-2 text-base text-foreground sm:h-12 [&_svg]:size-3.5"
                >
                  Talk to Founder <ChevronRight />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="mx-auto -mt-16 h-[25rem] w-[50rem] max-w-[90rem] translate-y-16 rounded border shadow-xl sm:h-auto sm:w-auto md:rounded-xl">
            <Image
              className="z-1 relative rounded md:rounded-xl"
              src="/hero.png"
              alt="Tailark hero section"
              width={2363}
              height={1635}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
