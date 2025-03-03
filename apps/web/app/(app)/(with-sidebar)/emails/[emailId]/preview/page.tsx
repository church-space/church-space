"use client";
import EmailPreview from "@/components/dnd-builder/email-preview";

export default function Page() {
  return (
    <div className="min-w-[100%] h-[100%] grid p-4">
      <EmailPreview showBackButton />
    </div>
  );
}
