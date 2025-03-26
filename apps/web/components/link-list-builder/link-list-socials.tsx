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

export const socialIcons = {
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

export interface SocialLink {
  icon: keyof typeof socialIcons;
  url: string;
  text?: string;
}

interface LinkListSocialsProps {
  style: "outline" | "filled" | "icon-only";
  color: string;
  iconColor: string;
  links: SocialLink[];
}

export default function LinkListSocials({
  style,
  color,
  iconColor,
  links,
}: LinkListSocialsProps) {
  return (
    <div className="mx-auto flex w-fit flex-wrap items-center justify-between gap-3 px-6">
      {links.map((link, index) => {
        const IconComponent = socialIcons[link.icon] || socialIcons.link;
        return (
          <div
            key={index}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: style === "filled" ? color : "transparent",
              color: iconColor,
              borderColor: style === "outline" ? iconColor : "transparent",
              borderWidth: style === "outline" ? "1px" : "0px",
            }}
          >
            <IconComponent
              height={style === "icon-only" ? "22" : "20"}
              width={style === "icon-only" ? "22" : "20"}
            />
          </div>
        );
      })}
    </div>
  );
}
