"use client";

import { Button } from "@church-space/ui/button";
import { ChevronRight } from "@church-space/ui/icons";
import Image from "next/image";
import Link from "next/link";
import HeroSubtitle from "./hero-subtitle";

export default function Hero() {
  return (
    <section className="flex -translate-y-16 flex-col overflow-hidden pb-0 pt-32 lg:flex-row lg:pt-48">
      <div className="mx-auto mb-0 flex w-full max-w-7xl flex-col items-center gap-8 lg:pb-32">
        <div className="flex min-w-[500px] flex-col items-center justify-center gap-3 px-6 md:max-w-[690px] lg:items-start lg:gap-6 lg:pl-16 lg:pr-0">
          <h1 className="text-balance text-center text-4xl font-bold sm:text-6xl lg:text-left lg:text-7xl">
            <span className="relative z-[2] mb-2 pb-10 text-white">
              The better way to
            </span>{" "}
            <span className="relative px-2 text-white">email your church</span>
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
                variant="ghost"
                className="h-10 gap-1 px-2 text-base text-white sm:h-12 [&_svg]:size-3.5"
              >
                Talk to Founder <ChevronRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl -translate-y-6 flex-col justify-end overflow-hidden md:translate-y-0">
        <div className="translate-x-16 translate-y-12 md:translate-x-36">
          <div className="[transform:rotateX(20deg);]">
            <div className="lg:h-176 relative skew-x-[.36rad]">
              <Image
                className="z-1 relative max-h-[2600px] w-auto rounded-md object-contain object-left"
                src="/hero.png"
                alt="Tailark hero section"
                width={3500}
                height={2600}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
