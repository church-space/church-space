"use client";

import React from "react";
import { QRCode } from "react-qrcode-logo";

export default function LinksSection() {
  return (
    <div
      className="grid w-full grid-cols-1 gap-4 pt-20 md:grid-cols-2"
      id="links"
    >
      <div className="flex w-full flex-col items-center justify-center gap-12 rounded-lg border bg-gradient-to-br from-background to-primary/10 p-6 py-8 md:p-16 md:py-16">
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">QR Codes</h2>
          <p className="max-w-sm text-pretty text-left text-muted-foreground">
            Manage your QR codes like never before. Create multiple for the same
            link to see where they were scan, update where they link to at any
            time, and design your codes to match your brand.{" "}
          </p>
        </div>
        <div className="relative">
          <div className="relative h-[200px] w-[200px]">
            <div className="z-5 absolute left-0 top-0 -rotate-6 transform opacity-90">
              <QRCode
                size={150}
                value="https://churchspace.co"
                bgColor="#D78260"
                fgColor="#ffffff"
                quietZone={10}
              />
            </div>
            <div className="absolute left-8 top-8 rotate-3 transform">
              <QRCode
                size={150}
                value="https://churchspace.co"
                bgColor="#6065FE"
                fgColor="#ffffff"
                quietZone={10}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-12 rounded-lg border bg-gradient-to-br from-background to-primary/10 p-6 py-8 pb-0 md:p-16 md:pb-0 md:pt-16">
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Link Pages</h2>
          <p className="max-w-sm text-pretty text-left text-muted-foreground">
            Create pages for your important links and resources to share with
            your congregation. They&apos;re perfect for sharing links in your
            social media bios.
          </p>
        </div>
        <div className="relative w-full">
          <div className="mx-auto flex h-[300px] w-full max-w-[400px] flex-col gap-2 overflow-hidden rounded-t-xl border bg-background">
            <div className="flex flex-col gap-2 border-b bg-gradient-to-br from-primary/80 to-primary p-8 py-6">
              <h3 className="mt-6 text-3xl font-semibold text-white">
                Welcome Home
              </h3>
              <p className="text-base text-white">
                Check out the links below for how to get more involved in the
                life of our church!
              </p>
              <div className="mt-6 flex h-12 items-center justify-center rounded-full bg-white text-center font-medium text-black">
                Plan your visit
              </div>
            </div>
            <div className="mx-6 mt-4 flex h-12 items-center justify-center overflow-hidden rounded-t-3xl bg-primary pt-4 text-center font-medium text-white">
              Church Website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
