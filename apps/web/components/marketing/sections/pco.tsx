import React from "react";
import PcoLogo from "@/public/pco-logo.png";
import Image from "next/image";

export default function PcoSection() {
  return (
    <div className="flex flex-col items-center">
      <Image src={PcoLogo} alt="Planning Center Logo" />
      Sync your planning center people and lists. Always up to date. Create
      automations, emails, etc based on lists.{" "}
    </div>
  );
}
