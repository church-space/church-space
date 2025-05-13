"use client";

import { Facebook, Spotify, TikTok } from "@church-space/ui/icons";
import React from "react";
import { QRCode } from "react-qrcode-logo";

export default function LinksSection() {
  return (
    <div
      className="bg-gradient-to-br from-primary to-primary/80 px-4 pb-24 pt-24"
      id="links"
    >
      <div className="mx-auto w-full max-w-6xl gap-4">
        <div className="mb-12 flex flex-col gap-4 px-2 md:items-center">
          <h2 className="max-w-64 text-5xl font-semibold text-white md:max-w-full md:text-6xl">
            Streamline your links
          </h2>
          <p className="max-w-sm text-pretty text-left text-xl text-white md:max-w-xl md:text-center md:text-2xl">
            Keep track of all your links in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex w-full flex-col items-center gap-6 rounded-lg border bg-gradient-to-br from-background/80 to-background p-6 md:p-8 md:py-8">
            <div className="relative">
              <div className="h-[300px] w-[200px]">
                <div className="z-5 absolute left-0 top-8 -rotate-6 transform rounded-md bg-white p-2 opacity-90">
                  <QRCode
                    size={150}
                    value="https://churchspace.co"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    quietZone={0}
                    ecLevel="Q"
                  />
                </div>
                <div className="absolute left-8 top-16 rotate-3 transform rounded-md bg-[#6065fe] p-2">
                  <QRCode
                    size={150}
                    value="https://churchspace.co"
                    bgColor="#6065FE"
                    fgColor="#ffffff"
                    quietZone={0}
                    logoImage="https://auth.churchspace.co/storage/v1/object/public/marketing//logoqr.png"
                    logoWidth={40}
                    logoHeight={65}
                    removeQrCodeBehindLogo={true}
                    ecLevel="Q"
                    logoPadding={5}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-xl font-semibold">Branded QR Codes</h3>
              <p className="max-w-sm text-pretty text-left text-muted-foreground">
                Create and design QR codes to match your brand. You can also
                easily update the URL for the QR code at any time in case you
                exported a mistake or just want to change where the QR code
                goes.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-6 rounded-lg border bg-gradient-to-br from-background/80 to-background p-6 md:p-8 md:py-8">
            <div className="relative">
              <div className="relative flex h-[300px] w-[220px] items-end justify-center">
                <div className="flex items-end gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-[250px] w-16 rounded-t-md bg-primary" />
                    Screens
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-[130px] w-16 rounded-t-md bg-primary" />
                    Seats
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-[190px] w-16 rounded-t-md bg-primary" />
                    Lobby
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-xl font-semibold">Deeper Insights</h3>
              <p className="max-w-sm text-pretty text-left text-muted-foreground">
                Ever wonder how effective your QR codes are? With Church Space,
                you can create multiple QR codes for the same link which helps
                you know where people are scanning your codes.
              </p>
            </div>
          </div>
          <div className="col-span-1 flex w-full flex-col items-center gap-6 rounded-lg border bg-gradient-to-br from-background/80 to-background p-6 md:col-span-2 md:flex-row-reverse md:p-8 md:py-8 lg:col-span-1 lg:flex-col">
            <div className="relative w-full">
              <div className="mx-auto flex h-[300px] w-full max-w-[340px] flex-col gap-2 overflow-hidden rounded-t-xl border bg-background md:mx-0 lg:mx-auto">
                <div className="flex flex-col border-b bg-gradient-to-br from-primary/80 to-primary p-6 py-3.5">
                  <p className="mt-5 text-2xl font-semibold text-white">
                    Welcome Home
                  </p>
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
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-xl font-semibold">A home for your links</h3>
              <p className="max-w-sm text-pretty text-left text-muted-foreground md:max-w-4xl lg:max-w-sm">
                Create pages for your important links and resources to share
                with your congregation. They&apos;re perfect for sharing links
                in your social media bios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
