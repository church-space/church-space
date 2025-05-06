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
import { useState, useEffect, useRef } from "react";
import { cn } from "@church-space/ui/cn";

export default function Hero() {
  type PreviewType = "emails" | "automations" | "links" | "qr";
  const previewTypes: PreviewType[] = ["emails", "automations", "links", "qr"];

  const [activePreview, setActivePreview] = useState<PreviewType>("emails");
  const [previewContent, setPreviewContent] = useState(
    "Email preview content here",
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activePreviewRef = useRef<PreviewType>("emails");

  const getPreviewContent = (type: PreviewType) => {
    switch (type) {
      case "emails":
        return "Email preview content here";
      case "automations":
        return "Automation workflow preview here";
      case "links":
        return "Link pages preview content here";
      case "qr":
        return "QR codes preview content here";
      default:
        return "emails / automations / links / qr codes";
    }
  };

  const startAutoRotation = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set new timer
    timerRef.current = setInterval(() => {
      const currentIndex = previewTypes.indexOf(activePreviewRef.current);
      const nextIndex = (currentIndex + 1) % previewTypes.length;
      // Force return to first item if we're at the end
      const nextPreview =
        currentIndex === previewTypes.length - 1
          ? previewTypes[0]
          : previewTypes[nextIndex];

      // Use direct state updates instead of handlePreviewChange to avoid resetting timer
      setIsTransitioning(true);
      setActivePreview(nextPreview);
      activePreviewRef.current = nextPreview;

      // Wait for fade out, then update content
      setTimeout(() => {
        setPreviewContent(getPreviewContent(nextPreview));
        setIsTransitioning(false);
      }, 300);
    }, 6000);
  };

  const handlePreviewChange = (previewType: PreviewType) => {
    if (previewType === activePreviewRef.current) return;

    // Clear existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsTransitioning(true);
    setActivePreview(previewType);
    activePreviewRef.current = previewType;

    // Wait for fade out, then update content
    setTimeout(() => {
      setPreviewContent(getPreviewContent(previewType));
      setIsTransitioning(false);
    }, 300); // Match this duration with CSS transition

    // Start a new timer immediately (will transition after 6 seconds)
    startAutoRotation();
  };

  // Set initial content and start auto-rotation
  useEffect(() => {
    setPreviewContent(getPreviewContent(activePreview));
    activePreviewRef.current = activePreview;
    startAutoRotation();

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
                className="h-10 gap-1 px-2 text-base text-secondary-foreground sm:h-12 [&_svg]:size-3.5"
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
              "bg-zinc-100 text-base text-black hover:bg-zinc-300 [&_svg]:size-5",
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
              "bg-zinc-100 text-base text-black hover:bg-zinc-300 [&_svg]:size-5",
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
              "bg-zinc-100 text-base text-black hover:bg-zinc-300 [&_svg]:size-5",
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
              "bg-zinc-100 text-base text-black hover:bg-zinc-300 [&_svg]:size-5",
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
        <div className="relative mx-auto aspect-video w-full max-w-7xl rounded-md bg-card outline outline-[1px] outline-muted md:rounded-xl">
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-transparent via-transparent to-background p-4 text-center backdrop-blur-sm">
            <div
              className={cn(
                "transition-opacity duration-300 ease-in-out",
                isTransitioning ? "opacity-0" : "opacity-100",
              )}
            >
              {previewContent}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
