"use client";

import { Facebook, Spotify, TikTok } from "@church-space/ui/icons";
import React from "react";
import { QRCode } from "react-qrcode-logo";

export default function LinksSection() {
  return (
    <div className="px-4 pt-12 md:pt-20" id="links">
      <div className="mx-auto w-full max-w-7xl gap-4">
        <div className="mb-12 flex flex-col gap-4 px-2 md:items-center">
          <h1 className="max-w-64 text-5xl font-semibold md:max-w-full md:text-6xl">
            Streamline your links
          </h1>
          <p className="max-w-sm text-pretty text-left text-xl text-muted-foreground md:max-w-xl md:text-center md:text-2xl">
            Keep track of all your links in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex w-full flex-col items-center justify-center gap-12 rounded-lg border bg-gradient-to-br from-background to-primary/5 p-6 py-8 dark:to-primary/10 md:p-16 md:py-16">
            <div className="flex flex-col items-start gap-2">
              <h2 className="text-xl font-semibold">QR Codes</h2>
              <p className="max-w-sm text-pretty text-left text-muted-foreground">
                Manage your QR codes like never before. Create multiple for the
                same link to see where they were scan, update where they link to
                at any time, and design your codes to match your brand.{" "}
              </p>
            </div>
            <div className="relative">
              <div className="relative h-[200px] w-[200px]">
                <div className="z-5 absolute left-0 top-0 -rotate-6 transform rounded-md bg-white p-2 opacity-90">
                  <QRCode
                    size={150}
                    value="https://churchspace.co"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    quietZone={0}
                  />
                </div>
                <div className="absolute left-8 top-8 rotate-3 transform rounded-md bg-[#6065fe] p-2">
                  <QRCode
                    size={150}
                    value="https://churchspace.co"
                    bgColor="#6065FE"
                    fgColor="#ffffff"
                    quietZone={0}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-12 rounded-lg border bg-gradient-to-br from-background to-primary/5 p-6 py-8 pb-0 dark:to-primary/10 md:p-16 md:pb-0 md:pt-16">
            <div className="flex flex-col items-start gap-2">
              <h2 className="text-xl font-semibold">Link Pages</h2>
              <p className="max-w-sm text-pretty text-left text-muted-foreground">
                Create pages for your important links and resources to share
                with your congregation. They&apos;re perfect for sharing links
                in your social media bios.
              </p>
            </div>
            <div className="relative w-full">
              <div className="mx-auto flex h-[300px] w-full max-w-[340px] flex-col gap-2 overflow-hidden rounded-t-xl border bg-background">
                <div className="flex flex-col border-b bg-gradient-to-br from-primary/80 to-primary p-6 py-3.5">
                  <h3 className="mt-5 text-2xl font-semibold text-white">
                    Welcome Home
                  </h3>
                  <p className="text-sm text-white">
                    Check out the links below for how to get more involved in
                    the life of our church!
                  </p>
                  <div className="mt-3 flex h-9 items-center justify-center rounded-full bg-white text-center text-sm font-medium text-black">
                    Plan your visit
                  </div>
                </div>
                <div className="flex w-full items-center justify-center gap-3.5 py-1">
                  <div className="flex items-center justify-center text-black dark:text-white">
                    <Facebook height={"24"} width={"24"} />
                  </div>
                  <div className="flex items-center justify-center text-black dark:text-white">
                    <TikTok height={"24"} width={"24"} />
                  </div>
                  <div className="flex items-center justify-center text-black dark:text-white">
                    <Spotify height={"22"} width={"22"} />
                  </div>
                </div>
                <div className="mx-6 flex h-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-center text-sm font-medium text-white">
                  Visit our website
                </div>
                <div className="mx-6 mt-1 flex h-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-center text-sm font-medium text-white">
                  Catch up on sermons
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
