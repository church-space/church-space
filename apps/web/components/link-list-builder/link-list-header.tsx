"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@church-space/ui/button";
import Link from "next/link";
import { createClient } from "@church-space/supabase/client";
import Image from "next/image";
import { cn } from "@church-space/ui/cn";

const ensureHttps = (url: string) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

interface LinkListHeaderProps {
  headerBgColor: string;
  headerTextColor: string;
  headerSecondaryTextColor: string;
  headerTitle: string;
  headerDescription: string;
  headerName: string;
  headerButtonText: string;
  headerButtonLink: string;
  headerButtonColor: string;
  headerButtonTextColor: string;
  headerImage: string;
  logoImage: string;
  mode: "builder" | "live";
  headerBlur: boolean;
}

export default function LinkListHeader({
  headerBgColor,
  headerTextColor,
  headerSecondaryTextColor,
  headerTitle,
  headerDescription,
  headerName,
  headerButtonText,
  headerButtonLink,
  headerButtonColor,
  headerButtonTextColor,
  headerImage,
  logoImage,
  mode,
  headerBlur,
}: LinkListHeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [bgImageUrl, setBgImageUrl] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    if (logoImage) {
      const { data: urlData } = supabase.storage
        .from("link-list-assets")
        .getPublicUrl(logoImage);
      setLogoUrl(urlData.publicUrl);
    } else {
      setLogoUrl("");
    }
  }, [logoImage]);

  useEffect(() => {
    if (headerImage) {
      const { data: urlData } = supabase.storage
        .from("link-list-assets")
        .getPublicUrl(headerImage);
      setBgImageUrl(urlData.publicUrl);
    } else {
      setBgImageUrl("");
    }
  }, [headerImage]);

  return (
    <div
      className="relative flex flex-col space-y-6 rounded-t-md p-6 py-10"
      style={{ backgroundColor: headerBgColor }}
    >
      {bgImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute ${headerBlur ? "-inset-8" : "inset-0"}`}>
            <Image
              src={bgImageUrl}
              alt="Background"
              fill
              className={`object-cover ${headerBlur ? "scale-110 opacity-50 blur-sm" : ""}`}
              priority
            />
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-md space-y-12">
        {(headerName || logoUrl) && (
          <div className="flex items-center gap-2">
            {logoUrl && (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={logoUrl} alt="Logo" fill className="object-cover" />
              </div>
            )}
            {headerName && (
              <div
                className="font-semibold tracking-tight"
                style={{ color: headerTextColor }}
              >
                {headerName}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex w-full flex-col gap-2",
            (!headerName || !logoUrl) && "mt-4",
          )}
        >
          {headerTitle && (
            <div
              className="text-pretty text-4xl font-bold tracking-tight"
              style={{ color: headerTextColor }}
            >
              {headerTitle}
            </div>
          )}
          {headerDescription && (
            <div
              className="mt-1 w-full text-pretty"
              style={{ color: headerSecondaryTextColor }}
            >
              {headerDescription}
            </div>
          )}
        </div>

        {headerButtonText &&
          headerButtonText.trim() !== "" &&
          mode === "live" && (
            <Link href={ensureHttps(headerButtonLink)} target="_blank">
              <Button
                className="mt-8 h-fit min-h-12 w-full text-balance rounded-full font-semibold shadow-sm"
                style={{
                  backgroundColor: headerButtonColor,
                  color: headerButtonTextColor,
                }}
              >
                {headerButtonText}
              </Button>
            </Link>
          )}
        {headerButtonText &&
          headerButtonText.trim() !== "" &&
          mode === "builder" && (
            <Button
              className="mt-8 h-fit min-h-12 w-full text-balance rounded-full font-semibold shadow-sm"
              style={{
                backgroundColor: headerButtonColor,
                color: headerButtonTextColor,
              }}
            >
              {headerButtonText}
            </Button>
          )}
      </div>
    </div>
  );
}
