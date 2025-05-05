"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import qrDarkSvg from "../svg/qr-dark.svg";
import qrLightSvg from "../svg/qr-light.svg";
import linkDarkSvg from "../svg/link-dark.svg";
import linkLightSvg from "../svg/link-light.svg";

export default function LinksSection() {
  const { theme } = useTheme();

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      <div className="rounded-xl border p-4">
        <h2 className="text-2xl font-bold">Emails</h2>
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="text-2xl font-bold">Automations</h2>
      </div>
      <div className="flex w-full flex-col gap-16">
        <div className="flex w-full items-center justify-center gap-12">
          <Image
            src={theme === "dark" ? qrLightSvg : qrDarkSvg}
            alt="QR Code illustration"
            width={100}
            height={100}
            className="w-full max-w-[300px]"
          />
          <div className="flex flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">QR Codes</h2>
            <p className="max-w-sm text-pretty text-left text-muted-foreground">
              Manage your QR codes like never before. Create multiple for the
              same link to see where they were scan, update where they link to
              at any time, and deisgn your codes to match your brand.{" "}
            </p>
          </div>
        </div>
        <div className="mt-16 flex w-full items-center justify-center gap-12">
          <Image
            src={theme === "dark" ? linkLightSvg : linkDarkSvg}
            alt="Link page illustration"
            width={96}
            height={96}
            className="w-full max-w-[300px]"
          />
          <div className="flex flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Link Pages</h2>
            <p className="max-w-sm text-pretty text-left text-muted-foreground">
              Create pages for your important links and resources to share with
              your congregation. They&apos;re perfect for sharing links in your
              social media bios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
