import React from "react";

export default function LinksSection() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border p-4 pb-0">
        <h2 className="text-2xl font-bold">Links</h2>
        Link Pages
        <div className="mx-auto mt-4 h-96 w-full max-w-sm rounded-t-lg bg-blue-500"></div>
      </div>
      <div className="rounded-xl border p-4">
        <h2 className="text-2xl font-bold">QR Codes</h2>
      </div>
    </div>
  );
}
