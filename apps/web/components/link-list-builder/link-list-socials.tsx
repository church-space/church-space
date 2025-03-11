"use client";

import React from "react";
import {
  MailFilled,
  Instagram,
  Facebook,
  Linkedin,
  Bluesky,
  LinkIcon,
  Threads,
  TikTok,
  XTwitter,
  Youtube,
} from "@church-space/ui/icons";

const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  x: XTwitter,
  mail: MailFilled,
  link: LinkIcon,
  facebook: Facebook,
  linkedin: Linkedin,
  bluesky: Bluesky,
  youtube: Youtube,
  threads: Threads,
};

interface LinkListSocialsProps {
  style: "outline" | "filled" | "icon-only";
}

// Helper function to get 5 random entries from socialIcons
const getRandomIcons = () => {
  const entries = Object.entries(socialIcons);
  const shuffled = [...entries].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

export default function LinkListSocials({ style }: LinkListSocialsProps) {
  const [randomIcons, setRandomIcons] = React.useState<[string, any][]>([]);

  React.useEffect(() => {
    setRandomIcons(getRandomIcons());
  }, []);

  return (
    <div className="mx-auto flex w-fit flex-wrap items-center justify-between gap-3 px-6">
      {randomIcons.map(([key, Icon]) => (
        <div
          key={key}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: style === "filled" ? "#ffffff" : "transparent",
            color: style === "filled" ? "#000000" : "#ffffff",
            borderColor: style === "outline" ? "#ffffff" : "transparent",
            borderWidth: style === "outline" ? "1px" : "0px",
          }}
        >
          <Icon
            height={style === "icon-only" ? "22" : "20"}
            width={style === "icon-only" ? "22" : "20"}
          />
        </div>
      ))}
    </div>
  );
}
