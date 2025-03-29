import React from "react";
import { Button } from "@church-space/ui/button";
import Link from "next/link";

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
}: LinkListHeaderProps) {
  return (
    <div
      className="flex flex-col space-y-6 rounded-t-md p-6 py-10"
      style={{ backgroundColor: headerBgColor }}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-accent"></div>
        <div
          className="font-semibold tracking-tight"
          style={{ color: headerTextColor }}
        >
          {headerName || "Church Name"}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div
          className="mt-8 text-pretty text-4xl font-bold tracking-tight"
          style={{ color: headerTextColor }}
        >
          {headerTitle || "This is a longer title for a list"}
        </div>
        <div
          className="mt-1 text-pretty"
          style={{ color: headerSecondaryTextColor }}
        >
          {headerDescription ||
            "This is a longer subtitle for a list. Now I'm making it even longer."}
        </div>
      </div>
      {headerButtonText && (
        <Link href={headerButtonLink} target="_blank">
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
    </div>
  );
}
