"use client";
import EmailPreview from "@/components/dnd-builder/email-preview";

export default function Page() {
  return (
    <div className="grid h-[100%] min-w-[100%] p-4">
      <EmailPreview showBackButton />
    </div>
  );
}
