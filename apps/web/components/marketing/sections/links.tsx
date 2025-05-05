import React from "react";

export default function LinksSection() {
  return (
    <div className="grid w-full grid-cols-1 gap-4">
      <div className="rounded-xl border p-4">
        <h2 className="text-2xl font-bold">Emails</h2>
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="text-2xl font-bold">Automations</h2>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">Links and QR Codes</h2>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex w-full flex-col items-center justify-center gap-2">
            {/* image here */}
            <h2 className="text-xl font-semibold">QR Codes</h2>
            <p className="max-w-sm text-pretty text-center text-muted-foreground">
              Manage your QR codes like never before. Create multiple for the
              same link to see where they were scan, update where they link to
              at any time, and deisgn your codes to match your brand.{" "}
            </p>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            {/* image here */}
            <h2 className="text-xl font-semibold">Link Pages</h2>
            <p className="max-w-sm text-pretty text-center text-muted-foreground">
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
