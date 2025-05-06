"use client";

import { Button } from "@church-space/ui/button";
import {
  LinkIcon,
  Qrcode,
  Waypoints,
  ChevronRight,
  Email,
} from "@church-space/ui/icons";
import Link from "next/link";
import HeroSubtitle from "./hero-subtitle";
import { useState, useEffect } from "react";
import { cn } from "@church-space/ui/cn";
import Image from "next/image";

export default function Hero() {
  type PreviewType = "emails" | "automations" | "links" | "qr";
  const previewTypes: PreviewType[] = ["emails", "automations", "links", "qr"];

  const [activePreview, setActivePreview] = useState<PreviewType>("emails");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    // Check initial dark mode
    const darkModeCheck = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
    };

    darkModeCheck();

    // Listen for changes
    const darkModeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMedia.addEventListener("change", listener);

    return () => darkModeMedia.removeEventListener("change", listener);
  }, []);

  const handlePreviewChange = (previewType: PreviewType) => {
    setActivePreview(previewType);
  };

  return (
    <section
      className="-translate-y-16 overflow-hidden pb-16 pt-32 lg:py-32 lg:pt-48"
      style={{
        background:
          "linear-gradient(99deg, #3264E4 0.49%, #9855C1 22.65%, #E26FA8 38.48%, #D7845B 66.45%, #E1B07C 88.08%, #F5D7AE 106.02%)",
      }}
    >
      <div className="mx-auto mb-12 flex w-full max-w-7xl flex-col items-center gap-8 sm:mb-28">
        <div className="flex min-w-[500px] flex-col items-center justify-center gap-3 px-6 md:max-w-[690px] lg:gap-6">
          <h1 className="text-balance text-center text-4xl font-bold sm:text-6xl lg:text-7xl">
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

      <div
        className="flex flex-col justify-center gap-6 px-4 md:px-8"
        id="emails"
      >
        <div className="mx-auto flex max-w-[300px] flex-wrap items-center justify-center gap-2 sm:max-w-2xl sm:gap-4">
          <Button
            size="sm"
            className={cn(
              "bg-white text-base text-zinc-700 transition-colors duration-300 hover:bg-zinc-200 [&_svg]:size-5",
              activePreview === "emails" && "bg-zinc-200",
            )}
            onClick={() => handlePreviewChange("emails")}
          >
            <span className="hidden sm:block">
              <Email />
            </span>
            Emails
          </Button>
          <Button
            size="sm"
            className={cn(
              "bg-white text-base text-zinc-700 transition-colors duration-300 hover:bg-zinc-200 [&_svg]:size-5",
              activePreview === "automations" && "bg-zinc-200",
            )}
            onClick={() => handlePreviewChange("automations")}
          >
            <span className="hidden sm:block">
              <Waypoints />
            </span>
            Automations
          </Button>
          <Button
            size="sm"
            className={cn(
              "bg-white text-base text-zinc-700 transition-colors duration-300 hover:bg-zinc-200 [&_svg]:size-5",
              activePreview === "links" && "bg-zinc-200",
            )}
            onClick={() => handlePreviewChange("links")}
          >
            <span className="hidden sm:block">
              <LinkIcon />
            </span>
            Link Pages
          </Button>
          <Button
            size="sm"
            className={cn(
              "bg-white text-base text-zinc-700 transition-colors duration-300 hover:bg-zinc-200 [&_svg]:size-5",
              activePreview === "qr" && "bg-zinc-200",
            )}
            onClick={() => handlePreviewChange("qr")}
          >
            <span className="hidden sm:block">
              <Qrcode />
            </span>
            QR Codes
          </Button>
        </div>
        <div
          className="relative mx-auto aspect-video w-full max-w-7xl rounded-md bg-background py-1"
          style={{ minHeight: "500px" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-full w-full">
              <Image
                src={isDarkMode ? "/email.png" : "/email-light.png"}
                alt="Email Preview"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="rounded-md object-cover pt-1.5"
                priority
                onError={(e) => {
                  console.error("Image failed to load:", e);
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
